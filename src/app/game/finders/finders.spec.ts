import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment } from '../../../environments/environment';
import { allFinders, finder } from '../../../test/utils';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Finders } from './finders';

const { baseUrl } = environment;

const setup = () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()],
  });
  const httpTesting = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(Finders);
  return { httpTesting, service };
};

describe('Finders', () => {
  it('should get all finders', () => {
    const { service, httpTesting } = setup();
    const allFinders$ = service.getAllFinders();
    let resData: unknown;
    let resError: unknown;
    allFinders$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'GET', url: `${baseUrl}/finders` },
      'Request to create a new finder'
    );
    req.flush(allFinders);
    expect(resData).toStrictEqual(allFinders);
    expect(resError).toBeUndefined();
    httpTesting.verify();
  });

  it('should fail to get all finders', () => {
    const { service, httpTesting } = setup();
    const allFinders$ = service.getAllFinders();
    let resData: unknown;
    let resError: unknown;
    allFinders$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'GET', url: `${baseUrl}/finders` },
      'Request to create a new finder'
    );
    req.flush(null, { status: 500, statusText: 'internal server error' });
    expect(resError).toBeInstanceOf(HttpErrorResponse);
    expect(resData).toBeUndefined();
    httpTesting.verify();
  });

  it('should create new finder', () => {
    const { service, httpTesting } = setup();
    const finder$ = service.createFinder();
    let resData: unknown;
    let resError: unknown;
    finder$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'POST', url: `${baseUrl}/finders` },
      'Request to create a new finder'
    );
    req.flush(finder, { status: 201, statusText: 'Created' });
    expect(resData).toStrictEqual(finder);
    expect(resError).toBeUndefined();
    httpTesting.verify();
  });

  it('should fail to create new finder', () => {
    const { service, httpTesting } = setup();
    const finder$ = service.createFinder();
    let resData: unknown;
    let resError: unknown;
    finder$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'POST', url: `${baseUrl}/finders` },
      'Request to create a new finder'
    );
    req.flush(null, { status: 500, statusText: 'internal server error' });
    expect(resError).toBeInstanceOf(HttpErrorResponse);
    expect(resData).toBeUndefined();
    httpTesting.verify();
  });

  it('should update a finder', () => {
    const { service, httpTesting } = setup();
    const updatedFinder = { ...finder, name: 'Tester' };
    const finder$ = service.updateFinder(updatedFinder.id, { name: updatedFinder.name });
    let resData: unknown;
    let resError: unknown;
    finder$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'PATCH', url: `${baseUrl}/finders/${updatedFinder.id}` },
      'Request to update a finder'
    );
    req.flush(updatedFinder, { status: 200, statusText: 'Patched' });
    expect(resData).toStrictEqual(updatedFinder);
    expect(resError).toBeUndefined();
    httpTesting.verify();
  });

  it('should fail to update a finder', () => {
    const { service, httpTesting } = setup();
    const finder$ = service.updateFinder(finder.id, { name: 'Wrong' });
    let resData: unknown;
    let resError: unknown;
    finder$.subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
    const req = httpTesting.expectOne(
      { method: 'PATCH', url: `${baseUrl}/finders/${finder.id}` },
      'Request to update a finder'
    );
    const error = { message: 'invalid name' };
    req.flush(error, { status: 400, statusText: 'bad request' });
    expect(resError).toBeInstanceOf(HttpErrorResponse);
    expect(resError).toHaveProperty('error', error);
    expect(resData).toBeUndefined();
    httpTesting.verify();
  });
});
