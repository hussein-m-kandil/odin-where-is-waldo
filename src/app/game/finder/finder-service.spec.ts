import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment } from '../../../environments/environment';
import { finder, localStorageMock } from '../../../test/utils';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';
import { FinderService } from './finder-service';
import { TestBed } from '@angular/core/testing';

const { baseUrl } = environment;

const setup = () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()],
  });
  const httpTesting = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(FinderService);
  const finder$ = service.getFinder();
  return { httpTesting, service, finder$ };
};

describe('FinderService', () => {
  it('should create new finder', () => {
    const { finder$, httpTesting } = setup();
    let resData: unknown;
    let resError: unknown;
    finder$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'POST', url: `${baseUrl}/finders` },
      'Request to create a new finder'
    );
    req.flush(finder, { status: 201, statusText: 'Created' });
    expect(req.request.method).toBe('POST');
    expect(resData).toStrictEqual(finder);
    expect(resError).toBeUndefined();
    httpTesting.verify();
  });

  it('should verify old finder', async () => {
    const originalLocalStorage = window.localStorage;
    window.localStorage = { ...localStorageMock, getItem: vi.fn(() => finder.id) };
    const { finder$, httpTesting } = setup();
    let resData: unknown;
    let resError: unknown;
    finder$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'GET', url: `${baseUrl}/finders/${finder.id}` },
      'Request to verify an old finder'
    );
    req.flush(finder);
    expect(resData).toStrictEqual(finder);
    expect(resError).toBeUndefined();
    httpTesting.verify();
    window.localStorage = originalLocalStorage;
  });
});
