import { Point, SelectedPoint } from './character-selection.types';
import { signal, Injectable } from '@angular/core';
import { Character } from '../characters.types';

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
    console.log(this._selectedPoint()?.natural); // TODO: Delete this line!
  }

  deselect() {
    this._setSelectionState(null, null);
  }

  evaluate(selectedCharacterName: Character['name']): boolean {
    const selectedPoint = this._selectedPoint();
    if (selectedPoint) {
      const characters = [
        {
          name: 'waldo',
          position: { minX: 2140, maxX: 2245, minY: 1140, maxY: 1260 },
        },
        {
          name: 'odlaw',
          position: { minX: 790, maxX: 840, minY: 1010, maxY: 1060 },
        },
        {
          name: 'wilma',
          position: { minX: 1230, maxX: 1280, minY: 650, maxY: 700 },
        },
        {
          name: 'wizard',
          position: { minX: 145, maxX: 215, minY: 1150, maxY: 1265 },
        },
      ];
      const selected = selectedPoint.natural;
      for (const { name, position } of characters) {
        console.log({ [name]: position }, { [selectedCharacterName]: selected });
        if (
          name === selectedCharacterName &&
          selected.x > position.minX &&
          selected.x < position.maxX &&
          selected.y > position.minY &&
          selected.y < position.maxY
        ) {
          alert(`${selectedCharacterName} found ;)`);
          return true;
        }
      }
    }
    alert(`${selectedCharacterName} not found :(`);
    return false;
  }
}
