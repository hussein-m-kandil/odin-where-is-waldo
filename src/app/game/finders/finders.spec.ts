import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { finder } from '../../../test/utils';
import { Finders } from './finders';

const { baseUrl } = environment;

const setup = () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()],
  });
  const httpTesting = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(Finders);
  const finder$ = service.createFinder();
  return { httpTesting, service, finder$ };
};

describe('Finders', () => {
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
});
