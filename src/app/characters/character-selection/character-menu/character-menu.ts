import { Placement, Point } from '../character-selection.types';
import { CharacterSelection } from '../character-selection';
import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Characters } from '../../characters';

@Component({
  selector: 'app-character-menu',
  imports: [NgOptimizedImage],
  templateUrl: './character-menu.html',
  styleUrl: './character-menu.css',
})
export class CharacterMenu {
  readonly characterSelection = inject(CharacterSelection);
  readonly characters = inject(Characters);

  protected generatePlacementStyle(placement?: Placement): Record<string, string> {
    if (placement) {
      return Object.fromEntries(Object.entries(placement).map(([prop, num]) => [prop, `${num}px`]));
    }
    return {};
  }

  protected calcSelectorMarkerPlacement(relativePoint: Point): Placement {
    const markerSize = 20;
    const markerHalfSize = markerSize / 2;
    const frame = this.characterSelection.imageElement || document.documentElement;
    console.log(frame); // TODO: Delete this line!
    const frameRect = frame.getBoundingClientRect();
    const maxY = frameRect.height - markerSize;
    const maxX = frameRect.width - markerSize;
    const minX = 0;
    const minY = 0;
    return {
      left: Math.min(Math.max(relativePoint.x - markerHalfSize, minX), maxX),
      top: Math.min(Math.max(relativePoint.y - markerHalfSize, minY), maxY),
      height: markerSize,
      width: markerSize,
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
