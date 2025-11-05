import {
  inject,
  signal,
  computed,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { CharacterMenu } from './characters/character-selection/character-menu/character-menu';
import { CharacterSelection } from './characters/character-selection/character-selection';
import { FinderList } from './finders/finder-list/finder-list';
import { FinderForm } from './finders/finder-form/finder-form';
import { Character } from './characters/characters.types';
import { Characters } from './characters/characters';
import { NgOptimizedImage } from '@angular/common';
import { Finder } from './finders/finders.types';
import { Notifier } from './notifier/notifier';
import { Finders } from './finders/finders';
import { Sounds } from './sounds/sounds';
import { Timer } from './timer/timer';
import { Stats } from './stats/stats';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [NgOptimizedImage, CharacterMenu, FinderList, FinderForm, Stats],
  templateUrl: './game.html',
})
export class Game implements OnDestroy {
  private readonly _crowdedImage = viewChild<ElementRef<HTMLImageElement>>('crowd');

  protected readonly _characters = inject(Characters);
  protected get characters() {
    return this._characters.data;
  }

  protected readonly notifier = inject(Notifier);
  private readonly _finders = inject(Finders);
  protected readonly sounds = inject(Sounds);
  protected readonly timer = inject(Timer);

  protected readonly finder = signal<Finder | null>(null);
  protected readonly loading = signal(false);

  protected readonly characterSelection = inject(CharacterSelection);
  private readonly _removeCharacterSelection = () => this.characterSelection.deselect();
  private readonly _removeCharacterSelectionOnEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._removeCharacterSelection();
  };
  private readonly _removeCharacterSelectionOnClickOutside = (e: MouseEvent) => {
    const imageElement = this._crowdedImage()?.nativeElement;
    if (imageElement) {
      const { top, left, right, bottom } = imageElement.getBoundingClientRect();
      if (e.x < left || e.x > right || e.y < top || e.y > bottom) {
        this._removeCharacterSelection();
      }
    }
  };

  protected readonly foundCharacters = computed(() => this.characterSelection.getFoundCharacters());
  protected readonly gameOver = computed<boolean>(
    () => this.foundCharacters().length >= this.characters.length
  );
  protected readonly playable = computed(() =>
    Boolean(this.finder() && !this.loading() && !this.gameOver())
  );

  constructor() {
    afterNextRender({
      write: () => {
        document.addEventListener('click', this._removeCharacterSelectionOnClickOutside);
        document.addEventListener('keydown', this._removeCharacterSelectionOnEscape);
      },
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this._removeCharacterSelectionOnClickOutside);
    document.removeEventListener('keydown', this._removeCharacterSelectionOnEscape);
  }

  protected start() {
    if (!this.loading()) {
      this.loading.set(true);
      this._finders
        .createFinder()
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (finder) => {
            this.finder.set(finder);
            this.timer.start();
            this.sounds.start();
          },
          error: () => this.notifier.notify({ message: 'Failed to start!', type: 'error' }),
        });
    }
  }

  protected reset() {
    this.timer.reset();
    this.finder.set(null);
    this.characterSelection.reset();
    this.notifier.notify(this.notifier.defaultNotification, 0);
  }

  protected escape() {
    if (this.playable()) {
      this.timer.stop();
      this.reset();
      this.sounds.escape();
    }
  }

  protected selectCharacter(e: MouseEvent) {
    if (this.playable()) {
      const imageElement = this._crowdedImage()?.nativeElement;
      if (imageElement) {
        // Stop propagation to prevent removing the selection under any circumstances,
        // e.g., in case of selecting by pressing Enter key while focusing the target (button)
        e.stopPropagation();
        const point = { x: Math.trunc(e.offsetX), y: Math.trunc(e.offsetY) };
        this.characterSelection.select(imageElement, point);
      }
    }
  }

  protected evaluateSelectedCharacter(name: Character['name']) {
    if (this.playable()) {
      const selectedPoint = this.characterSelection.selectedPoint?.natural;
      const finder = this.finder();
      if (selectedPoint && finder && finder.id) {
        this.loading.set(true);
        this.characterSelection
          .evaluate(name, selectedPoint, finder.id)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: (evaluationResult) => {
              const { evaluation } = evaluationResult;
              const displayName =
                name === 'wizard'
                  ? 'The Wizard'
                  : `${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`;
              if (evaluation[name]) {
                this.notifier.notify({ message: `Yes, this is ${displayName}!`, type: 'success' });
                if (this.gameOver()) {
                  this.timer.stop();
                  this.sounds.end();
                } else {
                  this.sounds.win();
                }
              } else {
                this.notifier.notify({
                  message: `No, this is not ${displayName}!`,
                  type: 'error',
                });
                this.sounds.lose();
              }
            },
            error: () =>
              this.notifier.notify({
                message: 'Sorry, your selection could not be evaluated!',
                type: 'error',
              }),
          });
      }
    }
    this._removeCharacterSelection();
  }
}
