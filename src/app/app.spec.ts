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
  it('should render counter', async () => {
    await renderApp();
    expect(screen.getByRole('heading', { name: /where('s| is) waldo/i })).toBeVisible();
  });
});
