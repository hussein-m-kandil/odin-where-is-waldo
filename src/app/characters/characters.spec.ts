import { describe, beforeEach, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Characters } from './characters';
import { appConfig } from '../app.config';

describe('Characters', () => {
  let service: Characters;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    service = TestBed.inject(Characters);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide an array of expected characters data', () => {
    expect(service.data).toBeInstanceOf(Array);
    expect(service.data.length).toBeGreaterThan(0);
    for (const character of service.data) {
      expect(character.src).toBeTypeOf('string');
      expect(character.alt).toBeTypeOf('string');
    }
  });

  it('should provide unique instance of the characters data', () => {
    const dataA = service.data;
    const dataB = service.data;
    expect(dataA).not.toBe(dataB);
    expect(dataA).toHaveLength(dataB.length);
    for (let i = 0; i < dataA.length; i++) {
      expect(dataA[i]).not.toBe(dataB[i]);
    }
  });
});
