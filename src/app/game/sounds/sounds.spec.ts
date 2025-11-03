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

const methods: (keyof InstanceType<typeof Sounds>)[] = ['end', 'win', 'lose', 'start', 'escape'];

describe('Sounds', () => {
  beforeEach(vi.clearAllMocks);

  it('should instantiate an Audio for each method, and load all instance', () => {
    setup();
    expect(audioSpy).toHaveBeenCalledTimes(methods.length);
    expect(htmlAudioMock.load).toHaveBeenCalledTimes(methods.length);
  });

  it('should reset all audio instances, then play audio', () => {
    const { service } = setup();
    vi.clearAllMocks(); // Clear any calls happened while constructing the service
    for (const method of methods) {
      service[method]();
    }
    expect(htmlAudioMock.load).toHaveBeenCalledTimes(methods.length ** 2);
    expect(htmlAudioMock.pause).toHaveBeenCalledTimes(methods.length ** 2);
    expect(htmlAudioMock.play).toHaveBeenCalledTimes(methods.length);
  });
});
