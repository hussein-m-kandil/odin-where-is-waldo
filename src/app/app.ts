import {
  inject,
  signal,
  effect,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
  computed,
} from '@angular/core';
import { CharacterMenu } from './characters/character-selection/character-menu/character-menu';
import { CharacterSelection } from './characters/character-selection/character-selection';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Character } from './characters/characters.types';
import { FinderService } from './finder/finder-service';
import { Characters } from './characters/characters';
import { RouterOutlet } from '@angular/router';
import { Finder } from './finder/finder.types';
import { finalize, interval, of } from 'rxjs';

interface Notification {
  type: 'error' | 'success' | 'normal';
  message: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, CharacterMenu, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly _crowdedImage = viewChild<ElementRef<HTMLImageElement>>('crowd');
  private readonly _finderService = inject(FinderService);
  protected readonly characters = inject(Characters);
  protected readonly finder = signal<Finder | null>(null);

  protected readonly secTimer$ = computed(() => {
    if (this.finder()) return interval(1000);
    return of(0);
  });

  protected readonly loading = signal(false);
  protected readonly notification = signal<Notification>({ type: 'normal', message: '' });
  private _notificationTimeoutID = 0;
  private _toastResettingEffect = effect((onCleanup) => {
    if (this.notification().message) {
      this._notificationTimeoutID = setTimeout(
        () => this.notification.set({ message: '', type: 'normal' }),
        3000
      );
      onCleanup(() => {
        clearTimeout(this._notificationTimeoutID);
        this._notificationTimeoutID = 0;
      });
    }
  });

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
      this._finderService
        .getFinder()
        .pipe(finalize(() => setTimeout(() => this.loading.set(false), 1000)))
        .subscribe({
          next: (finder) => this.finder.set(finder),
          error: () => this.notification.set({ message: 'Failed to start!', type: 'error' }),
        });
    }
  }

  protected selectCharacter(e: MouseEvent) {
    if (!this.loading()) {
      const imageElement = this._crowdedImage()?.nativeElement;
      if (imageElement) {
        // Stop propagation to prevent removing the selection under any circumstances,
        // e.g., in case of selecting by pressing Enter key while focusing the target (button)
        e.stopPropagation();
        const point = { x: Math.trunc(e.clientX), y: Math.trunc(e.clientY) };
        this.characterSelection.select(imageElement, point);
      }
    }
  }

  protected evaluateSelectedCharacter(name: Character['name']) {
    if (!this.loading()) {
      const selectedPoint = this.characterSelection.selectedPoint?.natural;
      const finder = this.finder();
      if (selectedPoint && finder && finder.id) {
        this.loading.set(true);
        this.characterSelection
          .evaluate(name, selectedPoint, finder.id)
          .pipe(finalize(() => setTimeout(() => this.loading.set(false), 1000)))
          .subscribe({
            next: (evaluationResult) => {
              const { evaluation } = evaluationResult;
              const displayName =
                name === 'wizard'
                  ? 'The Wizard'
                  : `${name[0].toUpperCase()}${name.slice(1).toLowerCase()}`;
              if (evaluation[name]) {
                this.notification.set({ message: `Yes, this is ${displayName}!`, type: 'success' });
              } else
                this.notification.set({
                  message: `No, this is not ${displayName}!`,
                  type: 'error',
                });
            },
            error: () =>
              this.notification.set({
                message: 'Sorry, your selection could not be evaluated!',
                type: 'error',
              }),
          });
      }
    }
    this._removeCharacterSelection();
  }
}
