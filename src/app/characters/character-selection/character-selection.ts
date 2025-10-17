import { Point, SelectedPoint } from './character-selection.types';
import { signal, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CharacterSelection {
  private _imageElement: HTMLImageElement | null = null;
  private readonly _selectedPoint = signal<SelectedPoint | null>(null);

  get imageElement(): typeof this._imageElement {
    return this._imageElement;
  }

  get selectedPoint(): ReturnType<typeof this._selectedPoint> {
    const currentSelectedPoint = this._selectedPoint();
    return currentSelectedPoint ? JSON.parse(JSON.stringify(currentSelectedPoint)) : null;
  }

  private _setSelectionState(
    imageElement: typeof this._imageElement,
    selectedPoint: ReturnType<typeof this._selectedPoint>
  ) {
    this._selectedPoint.set(selectedPoint);
    this._imageElement = imageElement;
  }

  select(imageElement: HTMLImageElement, absolutePoint: Point) {
    const scaleFactor = imageElement.naturalWidth / imageElement.clientWidth;
    const imgRect = imageElement.getBoundingClientRect();
    const relative = {
      x: Math.trunc(absolutePoint.x - imgRect.left),
      y: Math.trunc(absolutePoint.y - imgRect.top),
    };
    const natural = {
      x: Math.trunc(relative.x * scaleFactor),
      y: Math.trunc(relative.y * scaleFactor),
    };
    this._setSelectionState(imageElement, { absolute: absolutePoint, relative, natural });
  }

  deselect() {
    this._setSelectionState(null, null);
  }
}
