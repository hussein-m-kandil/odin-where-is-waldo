import { environment } from '../../../environments/environment';
import { Finder, NewFinder } from '../finders/finders.types';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const baseUrl = `${environment.baseUrl}/finders`;

@Injectable({
  providedIn: 'root',
})
export class Finders {
  private readonly _http = inject(HttpClient);

  getAllFinders() {
    return this._http.get<Finder[]>(baseUrl);
  }

  createFinder() {
    return this._http.post<Finder>(baseUrl, {});
  }

  updateFinder(id: Finder['id'], data: NewFinder) {
    return this._http.patch<Finder>(`${baseUrl}/${id}`, data);
  }
}
