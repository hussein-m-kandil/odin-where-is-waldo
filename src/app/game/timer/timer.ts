import { Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Timer {
  private readonly _seconds = signal(0);

  private readonly _incrementSeconds = () => {
    this._seconds.update((n) => n + 1);
  };

  private readonly _resetSeconds = () => {
    this._seconds.set(0);
  };

  private readonly _seconds$ = interval(1000);
  private _secondsSub: Subscription | null = null;

  get seconds() {
    return this._seconds();
  }

  start() {
    this._secondsSub = this._seconds$.subscribe(this._incrementSeconds);
  }

  stop() {
    this._secondsSub?.unsubscribe();
  }

  reset() {
    this._resetSeconds();
  }
}
