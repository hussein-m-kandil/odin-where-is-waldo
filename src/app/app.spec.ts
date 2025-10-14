import { provideZonelessChangeDetection } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
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

  it('should not render character selector on start', async () => {
    await renderApp();
    expect(screen.queryByLabelText(/selector menu/i)).toBeNull();
    expect(screen.queryByLabelText(/selector marker/i)).toBeNull();
    expect(screen.queryByLabelText(/character selector$/i)).toBeNull();
  });

  it('should render character selector after clicking the main image', async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    expect(screen.getByLabelText(/selector menu/i)).toBeVisible();
    expect(screen.getByLabelText(/selector marker/i)).toBeVisible();
    expect(screen.getByLabelText(/character selector$/i)).toBeVisible();
  });

  it('should remove character selector after clicking outside main image', async () => {
    const user = userEvent.setup();
    const { container } = await renderApp();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    await user.click(container);
    expect(screen.queryByLabelText(/selector menu/i)).toBeNull();
    expect(screen.queryByLabelText(/selector marker/i)).toBeNull();
    expect(screen.queryByLabelText(/character selector$/i)).toBeNull();
  });
});
