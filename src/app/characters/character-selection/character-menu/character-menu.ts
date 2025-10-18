import { Placement, Point, SelectedPoint } from '../character-selection.types';
import { Component, computed, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Characters } from '../../characters';
import { Character } from '../../characters.types';

@Component({
  selector: 'app-character-menu',
  imports: [NgOptimizedImage],
  templateUrl: './character-menu.html',
  styleUrl: './character-menu.css',
})
export class CharacterMenu {
  readonly characters = inject(Characters);

  readonly imageElement = input.required<HTMLImageElement>();
  readonly markerSize = input(20);
  readonly menuSize = input(100);
  readonly spacing = input(8);

  readonly selectedPoint = input.required<SelectedPoint>();
  protected readonly computedPlacementStyle = computed(() => {
    const markerPlacement = this.calcSelectorMarkerPlacement(this.selectedPoint().absolute);
    const menuPlacement = this.calcSelectorMenuPlacement(markerPlacement);
    return {
      marker: this.generatePlacementStyle(markerPlacement),
      menu: this.generatePlacementStyle(menuPlacement),
    };
  });

  readonly characterSelected = output<Character['name']>();

  protected selectCharacter(name: Character['name']) {
    this.characterSelected.emit(name);
  }

  protected generatePlacementStyle(placement: Placement): Record<string, string> {
    return Object.fromEntries(Object.entries(placement).map(([prop, num]) => [prop, `${num}px`]));
  }

  protected calcSelectorMarkerPlacement(point: Point): Placement {
    const imageRect = this.imageElement().getBoundingClientRect();
    const markerSize = this.markerSize();
    const markerHalfSize = markerSize / 2;
    const minTop = imageRect.top;
    const minLeft = imageRect.left;
    const maxTop = imageRect.bottom - markerSize;
    const maxLeft = imageRect.right - markerSize;
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
