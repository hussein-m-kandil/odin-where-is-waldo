import { CharacterSelection } from './character-selection';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';

describe('CharacterSelection', () => {
  let service: CharacterSelection;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    service = TestBed.inject(CharacterSelection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not have selection before calling `select`', () => {
    expect(service.selectedPoint).toBeNull();
  });

  it('should have selection after calling `select`', () => {
    const point = { x: 0, y: 0 };
    service.select(new Image(), point);
    expect(service.selectedPoint).toBeTruthy();
    expect(service.selectedPoint).toHaveProperty('absolute', point);
  });

  it('should not have selection after calling `deselect`', () => {
    service.select(new Image(), { x: 0, y: 0 });
    service.deselect();
    expect(service.selectedPoint).toBeNull();
  });
});
