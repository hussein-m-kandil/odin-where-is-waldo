import { Placement, Point } from '../character-selection.types';
import { CharacterSelection } from '../character-selection';
import { Component, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
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
  readonly markerSize = input(20);
  readonly menuSize = input(100);
  readonly spacing = input(8);

  protected generatePlacementStyle(placement?: Placement): Record<string, string> {
    if (placement) {
      return Object.fromEntries(Object.entries(placement).map(([prop, num]) => [prop, `${num}px`]));
    }
    return {};
  }

  protected calcSelectorMarkerPlacement(point: Point): Placement {
    const frame = this.characterSelection.imageElement || document.documentElement;
    const frameRect = frame.getBoundingClientRect();
    const markerSize = this.markerSize();
    const markerHalfSize = markerSize / 2;
    const maxTop = frameRect.bottom - markerSize;
    const maxLeft = frameRect.right - markerSize;
    const minLeft = frameRect.left;
    const minTop = frameRect.top;
    return {
      left: Math.min(Math.max(point.x - markerHalfSize, minLeft), maxLeft),
      top: Math.min(Math.max(point.y - markerHalfSize, minTop), maxTop),
      height: markerSize,
      width: markerSize,
    };
  }

  protected calcSelectorMenuPlacement(markerPlacement: Placement): Placement {
    const spacing = this.spacing();
    const menuSize = this.menuSize();
    const menuHalfSize = menuSize / 2;
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const markerTop = markerPlacement.top;
    const markerBottom = markerTop + markerPlacement.height;
    const markerCenterX = markerPlacement.width / 2 + markerPlacement.left;
    const markerCenterY = markerPlacement.height / 2 + markerPlacement.top;
    const maxTop = Math.min(markerBottom + spacing, vpHeight - menuSize);
    const minTop = Math.max(markerTop - (menuSize + spacing), 0);
    const maxLeft = vpWidth - menuSize;
    const minLeft = 0;
    return {
      left: Math.min(Math.max(markerCenterX - menuHalfSize, minLeft), maxLeft),
      top: markerCenterY <= vpHeight / 2 ? maxTop : minTop,
      height: menuSize,
      width: menuSize,
    };
  }
}
