import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { appConfig } from './app.config';

const renderComponent = async () => {
  // The `providers` prop is provided at the module level ('root')
  // https://testing-library.com/docs/angular-testing-library/api#providers
  return await render(App, { providers: appConfig.providers });
};

describe('App', () => {
  it('should render heading', async () => {
    await renderComponent();
    expect(screen.getByRole('heading', { name: /where('s| is) waldo/i })).toBeVisible();
  });

  it('should render images for Waldo and his friends', async () => {
    await renderComponent();
    expect(screen.getByRole('img', { name: /of waldo/i })).toBeVisible();
    expect(screen.getByRole('img', { name: /of odlaw/i })).toBeVisible();
    expect(screen.getByRole('img', { name: /of wilma/i })).toBeVisible();
    expect(screen.getByRole('img', { name: /of (wizard|whitebeard)/i })).toBeVisible();
  });

  it('should render crowded illustration, where we can find Waldo', async () => {
    await renderComponent();
    expect(screen.getByRole('img', { name: /crowded .* waldo/i })).toBeVisible();
  });
});
