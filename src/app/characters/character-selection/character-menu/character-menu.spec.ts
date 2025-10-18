import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { CharacterMenu } from './character-menu';
import { appConfig } from '../../../app.config';
import userEvent from '@testing-library/user-event';

const rect = new DOMRect(...Object.values({ x: 10, y: 10, w: 1600, h: 900 }));
const mockImageRect = vi.fn(() => rect);

const mockPoint = vi.fn(() => ({ x: 0, y: 0 }));

const mockImage = vi.fn(() => {
  const image = new Image(160, 90);
  image.getBoundingClientRect = mockImageRect;
  return image;
});

// Make the viewport's sides 10px wider than the image box
window.innerHeight = rect.bottom + rect.y; // <-y-><----h----><-y->
window.innerWidth = rect.right + rect.x; // <-x-><----w----><-x->
const spacing = 8;
const menuSize = 90;
const markerSize = 16;

const characterSelectedHandlerMock = vi.fn();

const renderComponent = async () => {
  const selectedPoint = { absolute: mockPoint(), relative: mockPoint(), natural: mockPoint() };
  const imageElement = mockImage();
  return await render(CharacterMenu, {
    providers: appConfig.providers,
    inputs: { markerSize, menuSize, spacing, imageElement, selectedPoint },
    on: { characterSelected: characterSelectedHandlerMock },
  });
};

const markerRegex = /marker/i;
const menuRegex = /menu/i;

describe('CharacterMenu', () => {
  afterEach(vi.clearAllMocks);

  it('should be rendered', async () => {
    await renderComponent();
    expect(screen.getByLabelText(menuRegex)).toBeVisible();
    expect(screen.getByLabelText(markerRegex)).toBeVisible();
  });

  it('should render the character images', async () => {
    await renderComponent();
    for (const character of ['odlaw', 'waldo', 'wilma', 'wizard']) {
      expect(screen.getByRole('img', { name: new RegExp(character, 'i') })).toBeVisible();
    }
  });

  describe('should be rendered beneath the marker', () => {
    it('should be rendered in the top-left corner', async () => {
      const point = { x: 0, y: 0 };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.left).toBe(`${rect.left}px`);
      expect(markerElement.style.top).toBe(`${rect.top}px`);
      expect(menuElement.style.left).toBe(`0px`);
      expect(menuElement.style.top).toBe(`${rect.y + markerSize + spacing}px`);
    });

    it('should be rendered in the top-center corner', async () => {
      const point = { x: window.innerWidth * 0.5, y: 0 };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${rect.top}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${rect.top + markerSize + spacing}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });

    it('should be rendered in the top-right corner', async () => {
      const point = { x: window.innerWidth, y: 0 };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${rect.top}px`);
      expect(markerElement.style.left).toBe(`${rect.right - markerSize}px`);
      expect(menuElement.style.top).toBe(`${rect.top + markerSize + spacing}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize}px`);
    });

    it('should be rendered in the top-left quadrant', async () => {
      const point = { x: window.innerWidth * 0.25, y: window.innerHeight * 0.25 };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${point.y - markerSize * 0.5}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${point.y + markerSize * 0.5 + spacing}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });

    it('should be rendered in the middle', async () => {
      const point = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${point.y - markerSize * 0.5}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${point.y + markerSize * 0.5 + spacing}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });

    it('should be rendered in the top-right quadrant', async () => {
      const point = { x: window.innerWidth * 0.75, y: window.innerHeight * 0.25 };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${point.y - markerSize * 0.5}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${point.y + markerSize * 0.5 + spacing}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });
  });

  describe('should be rendered above the marker', () => {
    it('should be rendered in the bottom-left corner', async () => {
      const point = { x: 0, y: window.innerHeight };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.left).toBe(`${rect.left}px`);
      expect(markerElement.style.top).toBe(`${rect.bottom - markerSize}px`);
      expect(menuElement.style.top).toBe(`${rect.bottom - markerSize - spacing - menuSize}px`);
      expect(menuElement.style.left).toBe(`0px`);
    });

    it('should be rendered in the bottom-left quadrant', async () => {
      const point = { x: window.innerWidth * 0.25, y: window.innerHeight };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${rect.bottom - markerSize}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${rect.bottom - markerSize - spacing - menuSize}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });

    it('should be rendered in the bottom-center corner', async () => {
      const point = { x: window.innerWidth * 0.5, y: window.innerHeight };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${rect.bottom - markerSize}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${rect.bottom - markerSize - spacing - menuSize}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });

    it('should be rendered in the bottom-right quadrant', async () => {
      const point = { x: window.innerWidth * 0.75, y: window.innerHeight };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${rect.bottom - markerSize}px`);
      expect(markerElement.style.left).toBe(`${point.x - markerSize * 0.5}px`);
      expect(menuElement.style.top).toBe(`${rect.bottom - markerSize - spacing - menuSize}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize * 0.5}px`);
    });

    it('should be rendered in the top-right corner', async () => {
      const point = { x: window.innerWidth, y: window.innerHeight };
      mockPoint.mockImplementationOnce(() => point);
      await renderComponent();
      const menuElement = screen.getByLabelText(menuRegex);
      const markerElement = screen.getByLabelText(markerRegex);
      expect(markerElement.style.top).toBe(`${rect.bottom - markerSize}px`);
      expect(markerElement.style.left).toBe(`${rect.right - markerSize}px`);
      expect(menuElement.style.top).toBe(`${rect.bottom - markerSize - spacing - menuSize}px`);
      expect(menuElement.style.left).toBe(`${point.x - menuSize}px`);
    });
  });

  it('should not call the given `characterSelected` handler if no character clicked', async () => {
    await renderComponent();
    expect(characterSelectedHandlerMock).not.toHaveBeenCalled();
  });

  it('should call the given `characterSelected` handler on character clicked', async () => {
    const user = userEvent.setup();
    await renderComponent();
    const characters = screen.getAllByRole('img');
    for (const character of characters) {
      await user.click(character);
    }
    expect(characters.length).toBeGreaterThan(0);
    expect(characterSelectedHandlerMock).toHaveBeenCalledTimes(characters.length);
  });
});
