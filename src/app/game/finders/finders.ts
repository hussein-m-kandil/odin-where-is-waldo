import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Finder } from '../finders/finders.types';

const baseUrl = `${environment.baseUrl}/finders`;

@Injectable({
  providedIn: 'root',
})
export class Finders {
  private readonly _http = inject(HttpClient);

  createFinder() {
    return this._http.post<Finder>(baseUrl, {});
  }
}
