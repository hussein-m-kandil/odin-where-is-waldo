import {
  signal,
  Component,
  OnDestroy,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Point, SelectedPoint } from '../types';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly crowdedImage = viewChild.required<ElementRef<HTMLImageElement>>('crowd');
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

  protected createMarkerStyle(relativePoint: Point) {
    const { clientWidth, clientHeight } = this.crowdedImage().nativeElement;
    const markerDiameter = 20;
    const markerRadius = markerDiameter / 2;
    const maxX = clientWidth - markerDiameter;
    const maxY = clientHeight - markerDiameter;
    return {
      left: `${Math.min(Math.max(relativePoint.x - markerRadius, 0), maxX)}px`,
      top: `${Math.min(Math.max(relativePoint.y - markerRadius, 0), maxY)}px`,
      height: `${markerDiameter}px`,
      width: `${markerDiameter}px`,
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
