import { provideZonelessChangeDetection } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Sounds } from './sounds';

const setup = () => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const service = TestBed.inject(Sounds);
  return { service };
};

const htmlAudioMock = {
  load: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
} as unknown as HTMLAudioElement;

const audioSpy = vi.spyOn(window, 'Audio').mockImplementation(() => htmlAudioMock);

type SoundMethod = 'end' | 'win' | 'lose' | 'start' | 'escape';
const soundMethods: SoundMethod[] = ['end', 'win', 'lose', 'start', 'escape'];

describe('Sounds', () => {
  beforeEach(vi.clearAllMocks);

  it('should instantiate an Audio for each method, and load all instance', () => {
    setup();
    expect(audioSpy).toHaveBeenCalledTimes(soundMethods.length);
    expect(htmlAudioMock.load).toHaveBeenCalledTimes(soundMethods.length);
  });

  it('should be enabled and reset all audio instances, then play audio', () => {
    const { service } = setup();
    vi.clearAllMocks(); // Clear any calls happened while constructing the service
    for (const method of soundMethods) {
      service[method]();
    }
    expect(service.enabled).toBe(true);
    expect(htmlAudioMock.play).toHaveBeenCalledTimes(soundMethods.length);
    expect(htmlAudioMock.load).toHaveBeenCalledTimes(soundMethods.length ** 2);
    expect(htmlAudioMock.pause).toHaveBeenCalledTimes(soundMethods.length ** 2);
  });

  it('should be disabled and do nothing when toggled', () => {
    const { service } = setup();
    vi.clearAllMocks(); // Clear any calls happened while constructing the service
    service.toggle();
    for (const method of soundMethods) {
      service[method]();
    }
    expect(service.enabled).toBe(false);
    expect(htmlAudioMock.load).toHaveBeenCalledTimes(0);
    expect(htmlAudioMock.play).toHaveBeenCalledTimes(0);
    expect(htmlAudioMock.pause).toHaveBeenCalledTimes(0);
  });

  it('should be enabled and reset/play sounds when toggled twice', () => {
    const { service } = setup();
    vi.clearAllMocks(); // Clear any calls happened while constructing the service
    service.toggle();
    service.toggle();
    for (const method of soundMethods) {
      service[method]();
    }
    expect(service.enabled).toBe(true);
    expect(htmlAudioMock.play).toHaveBeenCalledTimes(soundMethods.length);
    expect(htmlAudioMock.load).toHaveBeenCalledTimes(soundMethods.length ** 2);
    expect(htmlAudioMock.pause).toHaveBeenCalledTimes(soundMethods.length ** 2);
  });
});
