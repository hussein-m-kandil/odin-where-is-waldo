import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { provideZonelessChangeDetection } from '@angular/core';
import { EvaluationResult } from './character-selection.types';
import { CharacterSelection } from './character-selection';
import { provideHttpClient } from '@angular/common/http';
import { finder } from '../../../../test/utils';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

const { baseUrl } = environment;

const setup = () => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
  });
  const httpTesting = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(CharacterSelection);
  return { service, httpTesting };
};

describe('CharacterSelection', () => {
  it('should not have selection before calling `select`', () => {
    const { service } = setup();
    expect(service.selectedPoint).toBeNull();
  });

  it('should have selection after calling `select`', () => {
    const { service } = setup();
    const point = { x: 0, y: 0 };
    service.select(new Image(), point);
    expect(service.selectedPoint).toBeTruthy();
    expect(service.selectedPoint).toHaveProperty('relative', point);
  });

  it('should not have selection after calling `deselect`', () => {
    const { service } = setup();
    service.select(new Image(), { x: 0, y: 0 });
    service.deselect();
    expect(service.selectedPoint).toBeNull();
  });

  it('should evaluate the selection, and if succeeded, remember it (without duplications)', () => {
    const { service, httpTesting } = setup();
    const selectedPoint = { x: 0, y: 0 };
    const names: [string, boolean][] = [
      ['wizard', false],
      ['odlaw', false],
      ['waldo', true],
      ['wilma', true],
      ['wilma', true],
      ['waldo', true],
      ['odlaw', false],
      ['wizard', false],
    ];
    for (const [characterName, result] of names) {
      const evalRes: EvaluationResult = { evaluation: { [characterName]: result }, finder };
      let resData, resError;
      service
        .evaluate(characterName, selectedPoint, finder.id)
        .subscribe({ next: (d) => (resData = d), error: (e) => (resError = e) });
      httpTesting
        .expectOne(
          { method: 'POST', url: `${baseUrl}/eval/${finder.id}` },
          'Selection evaluation request'
        )
        .flush(evalRes);
      if (result) expect(service.getFoundCharacters()).toContain(characterName);
      else expect(service.getFoundCharacters()).not.toContain(characterName);
      expect(resData).toStrictEqual(evalRes);
      expect(resError).toBeUndefined();
      httpTesting.verify();
    }
    expect(service.getFoundCharacters()).toStrictEqual(
      Array.from(new Set(names.filter((x) => x[1]).map((x) => x[0])))
    );
  });

  it('should reset all state members', async () => {
    const { service, httpTesting } = setup();
    const point = { x: 0, y: 0 };
    const characterName = 'waldo';
    service.select(new Image(), point);
    const evalRes: EvaluationResult = { evaluation: { [characterName]: true }, finder };
    service.evaluate(characterName, point, finder.id).subscribe();
    httpTesting
      .expectOne(
        { method: 'POST', url: `${baseUrl}/eval/${finder.id}` },
        'Selection evaluation request'
      )
      .flush(evalRes);
    httpTesting.verify();
    expect(service.getFoundCharacters()).toStrictEqual([characterName]);
    expect(service.selectedPoint).toHaveProperty('relative', point);
    expect(service.imageElement).toBeInstanceOf(HTMLImageElement);
    service.reset();
    expect(service.imageElement).toBeNull();
    expect(service.selectedPoint).toBeNull();
    expect(service.getFoundCharacters()).toStrictEqual([]);
  });
});
