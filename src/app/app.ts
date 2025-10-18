import {
  inject,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { CharacterMenu } from './characters/character-selection/character-menu/character-menu';
import { CharacterSelection } from './characters/character-selection/character-selection';
import { Characters } from './characters/characters';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, CharacterMenu],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly _crowdedImage = viewChild.required<ElementRef<HTMLImageElement>>('crowd');

  protected readonly characterSelection = inject(CharacterSelection);
  protected readonly characters = inject(Characters);

  protected readonly removeCharacterSelection = () => this.characterSelection.deselect();
  protected readonly removeCharacterSelectionOnClickOutside = (e: MouseEvent) => {
    const { top, left, right, bottom } = this._crowdedImage().nativeElement.getBoundingClientRect();
    if (e.x < left || e.x > right || e.y < top || e.y > bottom) {
      this.removeCharacterSelection();
    }
  };
  protected readonly removeCharacterSelectionOnEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.removeCharacterSelection();
  };

  constructor() {
    afterNextRender({
      write: () => {
        document.addEventListener('click', this.removeCharacterSelectionOnClickOutside);
        document.addEventListener('keydown', this.removeCharacterSelectionOnEscape);
      },
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.removeCharacterSelectionOnClickOutside);
    document.removeEventListener('keydown', this.removeCharacterSelectionOnEscape);
  }

  protected selectCharacter(e: MouseEvent) {
    // Stop propagation to prevent removing the selection under any circumstances,
    // e.g., in case of selecting by pressing Enter key while focusing the target (button)
    e.stopPropagation();
    const point = { x: Math.trunc(e.clientX), y: Math.trunc(e.clientY) };
    const imageElement = this._crowdedImage().nativeElement;
    this.characterSelection.select(imageElement, point);
  }
}
