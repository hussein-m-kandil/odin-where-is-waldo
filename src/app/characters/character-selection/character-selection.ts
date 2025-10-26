import { Point, Finder, SelectedPoint, EvaluationResult } from './character-selection.types';
import { environment } from '../../../environments/environment';
import { signal, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class CharacterSelection {
  private _imageElement: HTMLImageElement | null = null;

  private readonly _selectedPoint = signal<SelectedPoint | null>(null);
  private readonly _validSelections = signal<Record<string, Point>>({});

  private readonly _http = inject(HttpClient);

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

  evaluate(characterName: string, selectedPoint: Point, finderId: Finder['id']) {
    const allSelections: ReturnType<typeof this._validSelections> = {
      ...this._validSelections(),
      [characterName]: selectedPoint,
    };
    return this._http.post<EvaluationResult>(`${baseUrl}/eval/${finderId}`, allSelections).pipe(
      tap({
        next: ({ evaluation }: EvaluationResult) => {
          const validEvaluation = evaluation[characterName];
          if (validEvaluation) this._validSelections.set(allSelections);
        },
      })
    );
  }

  getFoundCharacters(): string[] {
    return Object.keys(this._validSelections());
  }
}
