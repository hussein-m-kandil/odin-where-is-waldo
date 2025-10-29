import {
  Point,
  SelectedPoint,
  EvaluationResult,
} from './characters/character-selection/character-selection.types';
import { CharacterSelection } from './characters/character-selection/character-selection';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/angular';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { allFinders, finder } from '../../test/utils';
import { Characters } from './characters/characters';
import { HttpResponse } from '@angular/common/http';
import { Finders } from './finders/finders';
import { of, throwError } from 'rxjs';
import { Game } from './game';

const characters = new Characters();

const finders: Record<keyof Omit<Finders, '_http'>, Mock> = {
  getAllFinders: vi.fn(() => of(allFinders)),
  createFinder: vi.fn(() => of(finder)),
};

class CharacterSelectionMock {
  private _imageElement: HTMLImageElement | null = null;
  private readonly _selectedPoint = signal<SelectedPoint | null>(null);
  get selectedPoint() {
    return this._selectedPoint();
  }
  get imageElement() {
    return this._imageElement;
  }
  evaluate = vi.fn(() => of<EvaluationResult>({ evaluation: { waldo: true }, finder }));
  select = vi.fn((imageElement: HTMLImageElement, point: Point) => {
    this._selectedPoint.set({ absolute: point, relative: point, natural: point });
    this._imageElement = imageElement;
  });
  deselect = vi.fn(() => {
    this._selectedPoint.set(null);
    this._imageElement = null;
  });
  getFoundCharacters = vi.fn<() => string[]>(() => []);
}

const characterSelection = new CharacterSelectionMock();

const renderComponent = () => {
  // The `providers` prop is provided at the module level ('root')
  // https://testing-library.com/docs/angular-testing-library/api#providers
  return render(Game, {
    providers: [
      provideZonelessChangeDetection(),
      { provide: CharacterSelection, useValue: characterSelection },
      { provide: Finders, useValue: finders },
    ],
  });
};

describe('Game', () => {
  afterEach(vi.resetAllMocks);

  it('should render images for Waldo and his friends', async () => {
    await renderComponent();
    for (const character of characters.data) {
      expect(screen.getByRole('img', { name: character.image.alt })).toBeVisible();
    }
  });

  it('should render the start button', async () => {
    await renderComponent();
    expect(screen.getByRole('button', { name: /start/i })).toBeVisible();
  });

  it('should render the starting button, while loading start data', async () => {
    finders.createFinder.mockImplementationOnce(() =>
      throwError(() => new HttpResponse({ status: 500, statusText: 'internal server error' }))
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('button', { name: /starting/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /start(?!ing)/i })).toBeNull();
  });

  it('should re-render the start button again, if failed to start', async () => {
    finders.createFinder.mockImplementationOnce(() =>
      throwError(() => new HttpResponse({ status: 500, statusText: 'internal server error' }))
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await waitForElementToBeRemoved(() => screen.getByRole('button', { name: /starting/i }));
    expect(await screen.findByRole('button', { name: /start(?!ing)/i })).toBeVisible();
  });

  it('should render the crowded image where we can find Waldo, after successful start', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    vi.advanceTimersToNextTimer();
    expect(await screen.findByRole('img', { name: /crowded .* waldo/i })).toBeVisible();
    vi.useRealTimers();
  });

  it('should add character selection when the crowded image is clicked', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    vi.advanceTimersToNextTimer();
    await user.click(await screen.findByRole('img', { name: /crowded .* waldo/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should add character selection when the crowded image wrapper button is clicked', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    vi.advanceTimersToNextTimer();
    await user.click(await screen.findByRole('button', { name: /select.* character/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should add character selection when `Enter` pressed while focusing the crowded image wrapper button', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    vi.advanceTimersToNextTimer();
    await user.click(await screen.findByRole('button', { name: /select.* character/i }));
    await user.keyboard('{Enter}');
    expect(characterSelection.select).toHaveBeenCalledTimes(2);
    expect(characterSelection.deselect).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should remove character selection on a click that occurs outside the crowded image', async () => {
    vi.useFakeTimers();
    let user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    // For unknown reason I needed to setup user event again, otherwise the pointer event won't fire,
    // and using `fireEvent.click(documentElement, { x, y, clientX, clientY })` is another workaround
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.advanceTimersToNextTimer();
    const crowd = (await screen.findByRole('img', {
      name: /crowded .* waldo/i,
    })) as HTMLImageElement;
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
    vi.useRealTimers();
  });

  it('should remove character selection when `Escape` is pressed', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    vi.advanceTimersToNextTimer();
    await user.click(await screen.findByRole('img', { name: /crowded .* waldo/i }));
    characterSelection.deselect.mockClear();
    await user.keyboard('{Escape}');
    expect(characterSelection.deselect).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('should evaluate the selected character, then remove the character selection', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    for (const character of characters.data) {
      vi.advanceTimersToNextTimer();
      await user.click(await screen.findByRole('img', { name: /crowded .* waldo/i }));
      await user.click(
        await screen.findByRole('button', { name: new RegExp(`select.* ${character.name}`, 'i') })
      );
    }
    expect(characterSelection.evaluate).toHaveBeenCalledTimes(characters.data.length);
    expect(characterSelection.deselect).toHaveBeenCalledTimes(characters.data.length);
    vi.useRealTimers();
  });

  it('should display a notification about evaluation result', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    for (const { name } of characters.data) {
      vi.advanceTimersToNextTimer();
      const succeeded = Math.random() > 0.5;
      characterSelection.evaluate.mockImplementationOnce(() =>
        of({ evaluation: { [name]: succeeded }, finder })
      );
      await user.click(await screen.findByRole('img', { name: /crowded .* waldo/i }));
      const characterBtnRegex = new RegExp(`select.* ${name}`, 'i');
      await user.click(await screen.findByRole('button', { name: characterBtnRegex }));
      vi.advanceTimersToNextTimer();
      const notificationRegex = new RegExp(`${succeeded ? 'Yes' : 'No'},? .*${name}`, 'i');
      expect(await screen.findByText(notificationRegex)).toBeVisible();
    }
    vi.useRealTimers();
  });
});
