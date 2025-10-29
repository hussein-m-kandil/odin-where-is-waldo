import { vi } from 'vitest';

export const localStorageMock: Storage = {
  removeItem: vi.fn(),
  setItem: vi.fn(),
  getItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

export const finderDate = new Date().toISOString();
export const finder = {
  id: crypto.randomUUID(),
  createdAt: finderDate,
  updatedAt: finderDate,
  name: 'Anonymous',
  duration: null,
};
export const allFinders = [
  { ...finder, id: crypto.randomUUID(), duration: 3 },
  { ...finder, id: crypto.randomUUID(), duration: 7 },
  { ...finder, id: crypto.randomUUID(), duration: 9 },
];
