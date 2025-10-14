import {
  signal,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { Placement, Point, SelectedPoint } from '../types';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';

const CHARACTERS = [
  { src: '/odlaw.jpg', alt: 'An illustration of Odlaw.' },
  { src: '/waldo.jpg', alt: 'An illustration of Waldo.' },
  { src: '/wilma.jpg', alt: 'An illustration of Wilma.' },
  { src: '/wizard.jpg', alt: 'An illustration of Wizard Whitebeard.' },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly characters = CHARACTERS;
  protected readonly selectedPoint = signal<SelectedPoint | null>(null);
  private readonly crowdedImage = viewChild.required<ElementRef<HTMLImageElement>>('crowd');
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

  protected generatePlacementStyle(placement: Placement): Record<string, string> {
    return Object.fromEntries(Object.entries(placement).map(([prop, num]) => [prop, `${num}px`]));
  }

  protected calcSelectionMarkerPlacement(relativePoint: Point): Placement {
    const imgRect = this.crowdedImage().nativeElement.getBoundingClientRect();
    const markerDiameter = 20;
    const markerRadius = markerDiameter / 2;
    const maxX = imgRect.right - markerDiameter;
    const maxY = imgRect.bottom - markerDiameter;
    const minX = imgRect.left;
    const minY = imgRect.top;
    return {
      left: Math.min(Math.max(relativePoint.x - markerRadius, minX), maxX),
      top: Math.min(Math.max(relativePoint.y - markerRadius, minY), maxY),
      height: markerDiameter,
      width: markerDiameter,
    };
  }

  protected calcSelectionMenuPlacement(markerPlacement: Placement): Placement {
    const menuMargin = 8;
    const menuDiameter = 100;
    const menuRadius = menuDiameter / 2;
    const markerCenterX = markerPlacement.width / 2 + markerPlacement.left;
    return {
      top: Math.max(markerPlacement.top - (menuDiameter + menuMargin), 0),
      left: Math.max(markerCenterX - menuRadius, 0),
      height: menuDiameter,
      width: menuDiameter,
    };
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
