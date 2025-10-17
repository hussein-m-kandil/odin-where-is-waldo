import { CharacterSelection } from './characters/character-selection/character-selection';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { appConfig } from './app.config';
import { App } from './app';

const characterSelection = { select: vi.fn(), deselect: vi.fn() };

const renderComponent = async () => {
  // The `providers` prop is provided at the module level ('root')
  // https://testing-library.com/docs/angular-testing-library/api#providers
  return await render(App, {
    providers: [
      ...appConfig.providers,
      { provide: CharacterSelection, useValue: characterSelection },
    ],
  });
};

describe('App', () => {
  afterEach(vi.resetAllMocks);

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

  it('should call `CharacterSelection` `deselect` and `select` methods on click the crowded image', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).toHaveBeenCalledOnce();
  });

  it('should always call `CharacterSelection` `deselect` method before the `select` method', async () => {
    const results: ('select' | 'deselect')[] = [];
    characterSelection.deselect.mockImplementation(() => results.push('deselect'));
    characterSelection.select.mockImplementation(() => results.push('select'));
    const user = userEvent.setup();
    await renderComponent();
    const imageElement = screen.getByRole('img', { name: /crowded .* waldo/i });
    for (let i = 0; i < 7; i++) {
      await user.click(imageElement);
      expect(results).toStrictEqual(['deselect', 'select']);
      results.splice(0);
    }
  });

  it('should call `CharacterSelection` `deselect` method only on any click', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getAllByRole('heading')[0]);
    expect(characterSelection.select).not.toHaveBeenCalled();
    expect(characterSelection.deselect).toHaveBeenCalledOnce();
  });

  it('should call `CharacterSelection` `deselect` method only on press `Escape`', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    characterSelection.deselect.mockClear();
    await user.keyboard('{Escape}');
    expect(characterSelection.deselect).toHaveBeenCalledTimes(1);
  });

  it('should call `CharacterSelection` `deselect` method only on press `Tab`', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    characterSelection.deselect.mockClear();
    await user.keyboard('{Tab}');
    expect(characterSelection.deselect).toHaveBeenCalledTimes(1);
  });
});
