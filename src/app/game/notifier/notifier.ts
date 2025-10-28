import { Injectable, signal, effect } from '@angular/core';
import { Notification } from './notifier.types';

@Injectable({
  providedIn: 'root',
})
export class Notifier {
  readonly defaultNotification: Notification = { message: '', type: 'normal' };

  private _timeoutID = 0;
  private _tempDurationMS?: number;
  private _durationMS = 3000;

  private readonly _notification = signal<Notification>({ type: 'normal', message: '' });
  private _toastResettingEffect = effect((onCleanup) => {
    if (this._notification().message) {
      const ms = this._tempDurationMS ?? this._durationMS;
      this._tempDurationMS = undefined;
      this._timeoutID = setTimeout(() => this._notification.set(this.defaultNotification), ms);
      onCleanup(() => {
        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
      });
    }
  });

  get notification() {
    return JSON.parse(JSON.stringify(this._notification()));
  }

  notify(notification: Notification, tempDurationMS?: number) {
    this._tempDurationMS = tempDurationMS;
    this._notification.set(notification);
  }

  setDuration(durationMS: number) {
    this._durationMS = durationMS;
  }
}
