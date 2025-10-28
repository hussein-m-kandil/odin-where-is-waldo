import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Notification } from './notifier.types';
import { describe, expect, it, vi } from 'vitest';
import { Notifier } from './notifier';

const setup = () => {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const service = TestBed.inject(Notifier);
  return { service };
};

const successNotification: Notification = { type: 'success', message: 'Success notification' };
const errorNotification: Notification = { type: 'error', message: 'Error notification' };

describe('Notifier', () => {
  it('should have the default notification initially', () => {
    const { service } = setup();
    expect(service.notification).toStrictEqual(service.defaultNotification);
  });

  it('should set the notification', () => {
    const { service } = setup();
    service.notify(successNotification);
    expect(service.notification).toStrictEqual(successNotification);
  });

  it('should have the last notification', () => {
    const { service } = setup();
    service.notify(successNotification);
    service.notify(errorNotification);
    expect(service.notification).toStrictEqual(errorNotification);
  });

  it('should reset the notification after 3 seconds', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    service.notify(successNotification);
    await vi.advanceTimersByTimeAsync(2900);
    expect(service.notification).toStrictEqual(successNotification);
    await vi.advanceTimersByTimeAsync(100);
    expect(service.notification).toStrictEqual(service.defaultNotification);
    vi.useRealTimers();
  });

  it('should reset the notification, 3 seconds after the last notification', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    service.notify(errorNotification);
    await vi.advanceTimersByTimeAsync(2500);
    expect(service.notification).toStrictEqual(errorNotification);
    service.notify(successNotification);
    await vi.advanceTimersByTimeAsync(2900);
    expect(service.notification).toStrictEqual(successNotification);
    await vi.advanceTimersByTimeAsync(100);
    expect(service.notification).toStrictEqual(service.defaultNotification);
    vi.useRealTimers();
  });

  it('should reset the notification after custom duration, permanently', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    const durationMS = 5000;
    service.setDuration(durationMS);
    for (const notification of [successNotification, errorNotification]) {
      service.notify(notification);
      await vi.advanceTimersByTimeAsync(durationMS - 100);
      expect(service.notification).toStrictEqual(notification);
      await vi.advanceTimersByTimeAsync(111);
      expect(service.notification).toStrictEqual(service.defaultNotification);
    }
    vi.useRealTimers();
  });

  it('should reset the notification after custom duration, temporarily', async () => {
    vi.useFakeTimers();
    const { service } = setup();
    const durationMS = 5000;
    service.notify(successNotification, durationMS);
    await vi.advanceTimersByTimeAsync(durationMS - 100);
    expect(service.notification).toStrictEqual(successNotification);
    await vi.advanceTimersByTimeAsync(111);
    expect(service.notification).toStrictEqual(service.defaultNotification);
    service.notify(errorNotification);
    await vi.advanceTimersByTimeAsync(2900);
    expect(service.notification).toStrictEqual(errorNotification);
    await vi.advanceTimersByTimeAsync(100);
    expect(service.notification).toStrictEqual(service.defaultNotification);
    vi.useRealTimers();
  });
});
