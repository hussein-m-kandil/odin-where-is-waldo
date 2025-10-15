import {
  signal,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { CharacterSelector } from './character-selector/character-selector';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SelectedPoint } from '../types';

const CHARACTERS = [
  { src: '/odlaw.jpg', alt: 'An illustration of Odlaw.' },
  { src: '/waldo.jpg', alt: 'An illustration of Waldo.' },
  { src: '/wilma.jpg', alt: 'An illustration of Wilma.' },
  { src: '/wizard.jpg', alt: 'An illustration of Wizard Whitebeard.' },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage, CharacterSelector],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly characters = CHARACTERS;
  protected readonly crowdedImage = viewChild.required<ElementRef<HTMLImageElement>>('crowd');
  protected readonly selectedPoint = signal<SelectedPoint | null>(null);
  private readonly removeSelection = () => this.selectedPoint.set(null);

  constructor() {
    afterNextRender({
      write: () => {
        // Remove the selection on window-click in the capture phase (before other handlers),
        // if the click occurs on the crowded image, the selection will be made again,
        // otherwise it remains removed
        window.addEventListener('click', this.removeSelection, true);
      },
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.removeSelection, true);
  }

  protected selectCharacter(e: MouseEvent) {
    const img = this.crowdedImage().nativeElement;
    const imgRect = img.getBoundingClientRect();
    const scaleFactor = img.naturalWidth / img.clientWidth;
    const absolute = { x: Math.trunc(e.clientX), y: Math.trunc(e.clientY) };
    const relative = {
      x: Math.trunc(absolute.x - imgRect.left),
      y: Math.trunc(absolute.y - imgRect.top),
    };
    const natural = {
      x: Math.trunc(relative.x * scaleFactor),
      y: Math.trunc(relative.y * scaleFactor),
    };
    this.selectedPoint.set({ absolute, relative, natural });
  }
}
