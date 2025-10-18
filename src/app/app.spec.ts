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

  it('should add character selection when the crowded image is clicked', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).not.toHaveBeenCalled();
  });

  it('should add character selection when the crowded image wrapper button is clicked', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /select.* character/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).not.toHaveBeenCalled();
  });

  it.only('should add character selection when `Enter` pressed while focusing the crowded image wrapper button', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /select.* character/i }));
    await user.keyboard('{Enter}');
    expect(characterSelection.select).toHaveBeenCalledTimes(2);
    expect(characterSelection.deselect).not.toHaveBeenCalled();
  });

  it('should remove character selection on a click that occurs outside the crowded image', async () => {
    const user = userEvent.setup();
    await renderComponent();
    const crowd = screen.getByRole('img', { name: /crowded .* waldo/i })!;
    const { top, left, right, bottom } = crowd.getBoundingClientRect();
    const pointsOutsideCrowd = [
      { x: right + 1, y: bottom + 1 },
      { x: left - 1, y: bottom - 1 },
      { x: right + 1, y: top - 1 },
      { x: left - 1, y: top - 1 },
      { x: right, y: bottom + 1 },
      { x: right + 1, y: bottom },
      { x: left, y: top - 1 },
      { x: left - 1, y: top },
    ];
    for (const coords of pointsOutsideCrowd) {
      await user.pointer({ keys: '[MouseLeft]', coords });
    }
    expect(characterSelection.select).not.toHaveBeenCalled();
    expect(characterSelection.deselect).toHaveBeenCalledTimes(pointsOutsideCrowd.length);
  });

  it('should remove character selection when `Escape` is pressed', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('img', { name: /crowded .* waldo/i }));
    characterSelection.deselect.mockClear();
    await user.keyboard('{Escape}');
    expect(characterSelection.deselect).toHaveBeenCalledTimes(1);
  });
});
