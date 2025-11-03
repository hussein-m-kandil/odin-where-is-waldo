import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Sounds {
  private readonly _escapeAudio = new Audio('/sounds/i-am-shocked.mp3');
  private readonly _loseAudio = new Audio('/sounds/thats-a-lie.mp3');
  private readonly _endAudio = new Audio('/sounds/game-over.mp3');
  private readonly _startAudio = new Audio('/sounds/lets-go.mp3');
  private readonly _winAudio = new Audio('/sounds/good-boy.mp3');

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

  end() {
    this._reset();
    this._endAudio.play();
  }

  win() {
    this._reset();
    this._winAudio.play();
  }

  lose() {
    this._reset();
    this._loseAudio.play();
  }

  start() {
    this._reset();
    this._startAudio.play();
  }

  escape() {
    this._reset();
    this._escapeAudio.play();
  }
}
