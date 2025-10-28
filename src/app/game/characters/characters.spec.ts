import { provideZonelessChangeDetection } from '@angular/core';
import { describe, beforeEach, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Characters } from './characters';

describe('Characters', () => {
  let service: Characters;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(Characters);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide an array of expected characters data', () => {
    expect(service.data).toBeInstanceOf(Array);
    expect(service.data.length).toBeGreaterThan(0);
    for (const character of service.data) {
      expect(character.name).toBeTypeOf('string');
      expect(character.image.src).toBeTypeOf('string');
      expect(character.image.alt).toBeTypeOf('string');
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
