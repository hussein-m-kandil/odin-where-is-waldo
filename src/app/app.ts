import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected selectCharacter(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    const scaleFactor = img.naturalWidth / img.clientWidth;
    const naturalSelectedPoint = {
      x: Math.trunc(event.offsetX * scaleFactor),
      y: Math.trunc(event.offsetY * scaleFactor),
    };
    console.log('Selected point:', naturalSelectedPoint);
  }
}
