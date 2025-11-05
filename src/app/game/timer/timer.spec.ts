import { provideZonelessChangeDetection } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Timer } from './timer';

const setup = () => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const service = TestBed.inject(Timer);
  return { service };
};

describe('Timer', () => {
  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('should have a value of 0 seconds before starting', () => {
    const { service } = setup();
    expect(service.seconds).toBe(0);
  });

  it('should increment by 1 every second after starting', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    service.start();
    for (let i = 0; i < 7; i++) {
      expect(service.seconds).toBe(i);
      await vi.advanceTimersByTimeAsync(900);
      expect(service.seconds).toBe(i);
      await vi.advanceTimersByTimeAsync(100);
      expect(service.seconds).toBe(i + 1);
    }
    vi.useRealTimers();
  });

  it('should reset the seconds values to 0', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    service.start();
    for (let i = 0; i < 7; i++) {
      await vi.advanceTimersByTimeAsync(1000);
    }
    service.reset();
    expect(service.seconds).toBe(0);
    vi.useRealTimers();
  });

  it('should stop incrementing the seconds, and preserve the last seconds value', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    service.start();
    for (let i = 0; i < 7; i++) {
      await vi.advanceTimersByTimeAsync(1000);
    }
    service.stop();
    await vi.advanceTimersByTimeAsync(7000);
    expect(service.seconds).toBe(7);
    vi.useRealTimers();
  });

  it('should stop incrementing the seconds, and reset seconds value', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    service.start();
    for (let i = 0; i < 7; i++) {
      await vi.advanceTimersByTimeAsync(1000);
    }
    service.stop();
    service.reset();
    await vi.advanceTimersByTimeAsync(7000);
    expect(service.seconds).toBe(0);
    vi.useRealTimers();
  });
});
