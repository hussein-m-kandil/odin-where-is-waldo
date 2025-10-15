import { Placement, Point, SelectedPoint } from '../../types';
import { Component, ElementRef, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-character-selector',
  imports: [NgOptimizedImage],
  templateUrl: './character-selector.html',
  styleUrl: './character-selector.css',
})
export class CharacterSelector {
  readonly selectedPoint = input.required<SelectedPoint | null>();
  readonly characters = input.required<{ src: string; alt: string }[]>();
  readonly containerElementRef = input.required<ElementRef<HTMLElement>>();

  protected generatePlacementStyle(placement: Placement): Record<string, string> {
    return Object.fromEntries(Object.entries(placement).map(([prop, num]) => [prop, `${num}px`]));
  }

  protected calcSelectorMarkerPlacement(relativePoint: Point): Placement {
    const imgRect = this.containerElementRef().nativeElement.getBoundingClientRect();
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

  protected calcSelectorMenuPlacement(markerPlacement: Placement): Placement {
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
}
