import { Placement, Point, SelectedPoint } from '../character-selection.types';
import { Component, computed, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Character } from '../../characters.types';
import { Characters } from '../../characters';

@Component({
  selector: 'app-character-menu',
  imports: [NgOptimizedImage],
  templateUrl: './character-menu.html',
})
export class CharacterMenu {
  readonly characters = inject(Characters);

  readonly imageElement = input.required<HTMLImageElement>();
  readonly markerSize = input(16);
  readonly menuSize = input(96);
  readonly spacing = input(8);

  private readonly _imageRect = computed(() => this.imageElement().getBoundingClientRect());

  readonly selectedPoint = input.required<SelectedPoint>();
  protected readonly computedPlacementStyle = computed(() => {
    const markerPlacement = this.calcSelectorMarkerPlacement(this.selectedPoint().relative);
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
    const imageRect = this._imageRect();
    const markerSize = this.markerSize();
    const markerHalfSize = markerSize / 2;
    const maxTop = imageRect.height - markerSize;
    const maxLeft = imageRect.width - markerSize;
    const minLeft = 0;
    const minTop = 0;
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
    const imageRect = this._imageRect();
    const markerTop = markerPlacement.top;
    const markerBottom = markerTop + markerPlacement.height;
    const markerCenterX = markerPlacement.width / 2 + markerPlacement.left;
    const markerCenterY = markerPlacement.height / 2 + markerPlacement.top;
    const maxTop = Math.min(markerBottom + spacing, imageRect.height - menuSize);
    const minTop = Math.max(markerTop - (menuSize + spacing), 0);
    const maxLeft = imageRect.width - menuSize;
    const minLeft = 0;
    return {
      left: Math.min(Math.max(markerCenterX - menuHalfSize, minLeft), maxLeft),
      top: markerCenterY <= imageRect.height / 2 ? maxTop : minTop,
      height: menuSize,
      width: menuSize,
    };
  }
}
