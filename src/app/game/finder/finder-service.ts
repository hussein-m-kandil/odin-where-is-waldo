import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Finder } from './finder.types';
import { tap } from 'rxjs';

const FINDER_ID_KEY = 'fid';

const baseUrl = `${environment.baseUrl}/finders`;

@Injectable({
  providedIn: 'root',
})
export class FinderService {
  private readonly _http = inject(HttpClient);

  getFinder() {
    const finderId = this._getStoredFinderId();
    const req = finderId
      ? this._http.get<Finder>(`${baseUrl}/${finderId}`)
      : this._http.post<Finder>(baseUrl, {});
    return req.pipe(
      tap({
        next: (finder) => {
          console.log('Finder initiation succeeded: ', finder.name);
          this._storeFinderId(finder.id);
        },
        error: (error) => {
          console.log('Finder initiation failed: ', error);
          this._removeStoredFinderId(); // TODO: reset after notifying the user
        },
      })
    );
  }

  private _storeFinderId(finderId: string): void {
    try {
      localStorage.setItem(FINDER_ID_KEY, finderId);
    } catch (error) {
      console.log('Failed to save finder id on local storage', error);
    }
  }

  private _getStoredFinderId(): string | null {
    let finderId = '';
    try {
      finderId = localStorage.getItem(FINDER_ID_KEY) || '';
    } catch (error) {
      console.log('Failed to get finder id from local storage', error);
    }
    return finderId || null;
  }

  private _removeStoredFinderId(): void {
    try {
      localStorage.removeItem(FINDER_ID_KEY);
    } catch (error) {
      console.log('Failed to remove finder id from local storage', error);
    }
  }
}
