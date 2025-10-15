import {
  inject,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { CharacterSelection } from './characters/character-selection/character-selection';
import { CharacterSelector } from './character-selector/character-selector';
import { Characters } from './characters/characters';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, CharacterSelector],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly crowdedImage = viewChild.required<ElementRef<HTMLImageElement>>('crowd');
  protected readonly characterSelection = inject(CharacterSelection);
  protected readonly characters = inject(Characters);

  private readonly _removeCharacterSelection = () => this.characterSelection.deselect();

  constructor() {
    afterNextRender({
      write: () => {
        // Remove the selection on window-click in the capture phase (before other handlers),
        // if the click occurs on the crowded image, the selection will be made again,
        // otherwise it remains removed
        window.addEventListener('click', this._removeCharacterSelection, true);
      },
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this._removeCharacterSelection, true);
  }

  protected selectCharacter(e: MouseEvent) {
    const point = { x: Math.trunc(e.clientX), y: Math.trunc(e.clientY) };
    const imageElement = this.crowdedImage().nativeElement;
    this.characterSelection.select(imageElement, point);
  }
}
