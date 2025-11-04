import {
  Point,
  SelectedPoint,
  EvaluationResult,
} from './characters/character-selection/character-selection.types';
import { CharacterSelection } from './characters/character-selection/character-selection';
import { of, delay, throwError, observeOn, asyncScheduler } from 'rxjs';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { Characters } from './characters/characters';
import { findersMock } from './finders/finders.mock';
import { HttpResponse } from '@angular/common/http';
import { Finders } from './finders/finders';
import { finder } from '../../test/utils';
import { Sounds } from './sounds/sounds';
import { Game } from './game';

const characters = new Characters();

const soundsMock = {
  enabled: true,
  toggle: vi.fn(),
  escape: vi.fn(),
  start: vi.fn(),
  lose: vi.fn(),
  win: vi.fn(),
  end: vi.fn(),
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
  reset = vi.fn(() => {
    this._imageElement = null;
    this._selectedPoint.set(null);
  });
  evaluate = vi.fn(() => of<EvaluationResult>({ evaluation: { waldo: true }, finder }));
  select = vi.fn((imageElement: HTMLImageElement, point: Point) => {
    this._selectedPoint.set({ relative: point, natural: point });
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
      { provide: Finders, useValue: findersMock },
      { provide: Sounds, useValue: soundsMock },
    ],
  });
};

describe('Game', () => {
  afterEach(vi.resetAllMocks);

  it('should render faded images of Waldo and his friends', async () => {
    await renderComponent();
    for (const character of characters.data) {
      const img = screen.getByRole('img', { name: new RegExp(character.image.alt, 'i') });
      expect(img).toBeVisible();
      expect(img).toHaveClass(/opacity-\d{1,2}/i, /saturate-\d{1,2}/i);
    }
  });

  it('should display a colorful image of the founded characters only', async () => {
    const foundCharacters = characters.data.map((c) => c.name).filter(() => Math.random() > 0.5);
    characterSelection.getFoundCharacters.mockImplementation(() => foundCharacters);
    await renderComponent();
    for (const character of characters.data) {
      const img = screen.getByRole('img', { name: new RegExp(character.image.alt, 'i') });
      expect(img).toBeVisible();
      if (foundCharacters.includes(character.name)) {
        expect(img).not.toHaveClass(/opacity-\d{1,2}/i, /saturate-\d{1,2}/i);
      } else {
        expect(img).toHaveClass(/opacity-\d{1,2}/i, /saturate-\d{1,2}/i);
      }
    }
    characterSelection.getFoundCharacters.mockReset();
  });

  it('should render a button that toggles the game sounds', async () => {
    soundsMock.toggle.mockImplementation(() => (soundsMock.enabled = !soundsMock.enabled));
    const user = userEvent.setup();
    await renderComponent();
    for (let i = 0; i < 3; i++) {
      const soundsToggler = screen.getByRole('checkbox', { name: /sounds/i });
      await user.click(soundsToggler);
      expect(soundsToggler).toBeVisible();
      expect(soundsMock.toggle).toHaveBeenCalledTimes(i + 1);
      if (i % 2 === 0) expect(soundsToggler).not.toBeChecked();
      else expect(soundsToggler).toBeChecked();
    }
  });

  it('should render the start button', async () => {
    await renderComponent();
    expect(screen.getByRole('button', { name: /start/i })).toBeVisible();
  });

  it('should render the starting button, while loading start data', async () => {
    findersMock.createFinder.mockImplementationOnce(() => of(finder).pipe(delay(1000)));
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('button', { name: /starting/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /start(?!ing)/i })).toBeNull();
  });

  it('should re-render the start button again, if failed to start', async () => {
    vi.useFakeTimers();
    const delay = 1000;
    findersMock.createFinder.mockImplementationOnce(() =>
      throwError(() => new HttpResponse({ status: 500, statusText: 'internal server error' })).pipe(
        observeOn(asyncScheduler, delay)
      )
    );
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('button', { name: /starting/i })).toBeVisible();
    await vi.runAllTimersAsync();
    expect(screen.getByRole('button', { name: /start(?!ing)/i })).toBeVisible();
    vi.useRealTimers();
  });

  it('should render the escape button after starting', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(await screen.findByRole('button', { name: /escape/i })).toBeVisible();
  });

  it('should reset game state on escape button clicked, and play the corresponding sound', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('button', { name: /escape/i }));
    expect(await screen.findByRole('button', { name: /start/i })).toBeVisible();
    expect(screen.queryByRole('img', { name: /crowd.* waldo/i })).toBeNull();
    expect(screen.getByRole('table', { name: /finders/i })).toBeVisible();
    expect(characterSelection.reset).toHaveBeenCalledOnce();
    expect(soundsMock.escape).toHaveBeenCalledOnce();
  });

  it('should render the crowded image where we can find Waldo, and play the corresponding sound, on start', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(await screen.findByRole('img', { name: /crowd.* waldo/i })).toBeVisible();
    expect(soundsMock.start).toHaveBeenCalledOnce();
  });

  it('should add character selection when the crowded image is clicked', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('img', { name: /crowd.* waldo/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).not.toHaveBeenCalled();
  });

  it('should add character selection when the crowded image wrapper button is clicked', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('button', { name: /crowd.* waldo/i }));
    expect(characterSelection.select).toHaveBeenCalledOnce();
    expect(characterSelection.deselect).not.toHaveBeenCalled();
  });

  it('should add character selection when `Enter` pressed while focusing the crowded image wrapper button', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('button', { name: /crowd.* waldo/i }));
    await user.keyboard('{Enter}');
    expect(characterSelection.select).toHaveBeenCalledTimes(2);
    expect(characterSelection.deselect).not.toHaveBeenCalled();
  });

  it('should remove character selection on a click that occurs outside the crowded image', async () => {
    let user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    // For unknown reason I needed to setup user event again, otherwise the pointer event won't fire,
    // and using `fireEvent.click(documentElement, { x, y, clientX, clientY })` is another workaround
    user = userEvent.setup();
    const crowd = (await screen.findByRole('img', {
      name: /crowd.* waldo/i,
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
  });

  it('should remove character selection when `Escape` is pressed', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('img', { name: /crowd.* waldo/i }));
    characterSelection.deselect.mockClear();
    await user.keyboard('{Escape}');
    expect(characterSelection.deselect).toHaveBeenCalledTimes(1);
  });

  it('should evaluate the selected character, then remove the character selection', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    for (const character of characters.data) {
      await user.click(await screen.findByRole('img', { name: /crowd.* waldo/i }));
      await user.click(
        await screen.findByRole('button', { name: new RegExp(`select.* ${character.name}`, 'i') })
      );
    }
    expect(characterSelection.evaluate).toHaveBeenCalledTimes(characters.data.length);
    expect(characterSelection.deselect).toHaveBeenCalledTimes(characters.data.length);
  });

  it('should display a notification about evaluation result, and play the corresponding sound', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    for (const { name } of characters.data) {
      vi.clearAllMocks(); // Needed for checking the sounds methods
      const succeeded = Math.random() > 0.5;
      characterSelection.evaluate.mockImplementationOnce(() =>
        of({ evaluation: { [name]: succeeded }, finder })
      );
      await user.click(await screen.findByRole('img', { name: /crowd.* waldo/i }));
      const characterBtnRegex = new RegExp(`select.* ${name}`, 'i');
      await user.click(await screen.findByRole('button', { name: characterBtnRegex }));
      if (succeeded) {
        expect(await screen.findByText(new RegExp(`Yes,? .*${name}`, 'i'))).toBeVisible();
        expect(soundsMock.win).toHaveBeenCalledOnce();
      } else {
        expect(await screen.findByText(new RegExp(`No,? .*${name}`, 'i'))).toBeVisible();
        expect(soundsMock.lose).toHaveBeenCalledOnce();
      }
    }
  });

  it('should play the corresponding sound when the game is over', async () => {
    const getFoundCharacters = signal<string[]>([]);
    characterSelection.getFoundCharacters.mockImplementation(() => getFoundCharacters());
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    const charactersData = characters.data;
    for (const { name } of charactersData) {
      characterSelection.evaluate.mockImplementationOnce(() => {
        getFoundCharacters.set([...getFoundCharacters(), name]);
        return of({ evaluation: { [name]: true }, finder });
      });
      user.click(await screen.findByRole('img', { name: /crowd.* waldo/i }));
      user.click(await screen.findByRole('button', { name: new RegExp(`select.* ${name}`, 'i') }));
      expect(await screen.findByText(new RegExp(`Yes,? .*${name}`, 'i'))).toBeVisible();
    }
    expect(soundsMock.win).toHaveBeenCalledTimes(charactersData.length - 1);
    expect(soundsMock.end).toHaveBeenCalledOnce();
  });

  it('should prevent any further character selections when the game is over', async () => {
    characterSelection.getFoundCharacters.mockImplementationOnce(() =>
      characters.data.map((c) => c.name)
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    for (const { name } of characters.data) {
      await user.click(await screen.findByRole('img', { name: /crowd.* waldo/i }));
      const characterBtnRegex = new RegExp(`select.* ${name}`, 'i');
      await expect(() =>
        screen.findByRole('button', { name: characterBtnRegex })
      ).rejects.toThrowError();
    }
  });

  it('should prevent escaping when the game is over', async () => {
    characterSelection.getFoundCharacters.mockImplementationOnce(() =>
      characters.data.map((c) => c.name)
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.click(await screen.findByRole('button', { name: /escape/i }));
    await expect(() => screen.findByRole('button', { name: /start/i })).rejects.toThrowError();
    expect(screen.getByRole('img', { name: /crowd.* waldo/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /escape/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /escape/i })).toBeVisible();
    expect(screen.queryByRole('table', { name: /finders/i })).toBeNull();
    expect(characterSelection.reset).not.toHaveBeenCalled();
  });

  it('should display the finder form when the game is over', async () => {
    characterSelection.getFoundCharacters.mockImplementationOnce(() =>
      characters.data.map((c) => c.name)
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('form', { name: /finder/i })).toBeVisible();
    expect(screen.getByRole('textbox', { name: /name/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeVisible();
  });

  it('should reset the game after submitting the finder form successfully', async () => {
    characterSelection.getFoundCharacters.mockImplementationOnce(() =>
      characters.data.map((c) => c.name)
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /start/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
    expect(await screen.findByRole('button', { name: /start/i })).toBeVisible();
    expect(screen.queryByRole('img', { name: /crowd.* waldo/i })).toBeNull();
    expect(screen.getByRole('table', { name: /finders/i })).toBeVisible();
    expect(characterSelection.reset).toHaveBeenCalledOnce();
  });
});
