import { provideZonelessChangeDetection } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { App } from './app';

const renderApp = async () => {
  // The `providers` prop is provided at the module level ('root')
  // https://testing-library.com/docs/angular-testing-library/api#providers
  return await render(App, { providers: [provideZonelessChangeDetection()] });
};

describe('App', () => {
  it('should render heading', async () => {
    await renderApp();
    expect(screen.getByRole('heading', { name: /where('s| is) waldo/i })).toBeVisible();
  });

  it('should render images for Waldo and his friends', async () => {
    await renderApp();
    expect(screen.getByRole('img', { name: /of waldo/i })).toBeVisible();
    expect(screen.getByRole('img', { name: /of odlaw/i })).toBeVisible();
    expect(screen.getByRole('img', { name: /of wilma/i })).toBeVisible();
    expect(screen.getByRole('img', { name: /of (wizard|whitebeard)/i })).toBeVisible();
  });

  it('should render crowded illustration, where we can find Waldo', async () => {
    await renderApp();
    expect(screen.getByRole('img', { name: /crowded .* waldo/i })).toBeVisible();
  });
});
