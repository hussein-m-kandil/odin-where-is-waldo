import { allFinders, finder } from '../../../test/utils';
import { Finders } from './finders';
import { Mock, vi } from 'vitest';
import { of } from 'rxjs';

export const findersMock: Record<keyof Omit<Finders, '_http'>, Mock> = {
  getAllFinders: vi.fn(() => of(allFinders)),
  createFinder: vi.fn(() => of(finder)),
  updateFinder: vi.fn(() => of(finder)),
};
