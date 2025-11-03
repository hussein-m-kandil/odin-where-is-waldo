import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Sounds {
  private readonly _escapeAudio = new Audio('/sounds/i-am-shocked.mp3');
  private readonly _loseAudio = new Audio('/sounds/thats-a-lie.mp3');
  private readonly _endAudio = new Audio('/sounds/game-over.mp3');
  private readonly _startAudio = new Audio('/sounds/lets-go.mp3');
  private readonly _winAudio = new Audio('/sounds/good-boy.mp3');
  private readonly _enabled = signal(true);

  get enabled() {
    return this._enabled();
  }

  constructor() {
    this._load();
  }

  private _load() {
    this._escapeAudio.load();
    this._startAudio.load();
    this._loseAudio.load();
    this._winAudio.load();
    this._endAudio.load();
  }

  private _pause() {
    this._escapeAudio.pause();
    this._startAudio.pause();
    this._loseAudio.pause();
    this._winAudio.pause();
    this._endAudio.pause();
  }

  private _reset() {
    this._pause();
    this._load();
  }

  private _play(audio: HTMLAudioElement) {
    if (this._enabled()) {
      this._reset();
      audio.play();
    }
  }

  toggle() {
    this._enabled.update((enabled) => !enabled);
  }

  end() {
    this._play(this._endAudio);
  }

  win() {
    this._play(this._winAudio);
  }

  lose() {
    this._play(this._loseAudio);
  }

  start() {
    this._play(this._startAudio);
  }

  escape() {
    this._play(this._escapeAudio);
  }
}
