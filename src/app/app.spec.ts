import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { environment } from '../environments/environment';
import { provideRouter } from '@angular/router';
import { App } from './app';

const renderComponent = async () => {
  // The `providers` prop is provided at the module level ('root')
  // https://testing-library.com/docs/angular-testing-library/api#providers
  return await render(App, {
    providers: [provideRouter([]), provideZonelessChangeDetection()],
  });
};

describe('App', () => {
  afterEach(vi.resetAllMocks);

  it('should render a heading with the app title', async () => {
    await renderComponent();
    const heading = screen.getByRole('heading', { name: environment.title });
    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H1');
  });
});
