import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { CharacterSelector } from './character-selector';
import { SelectedPoint } from '../../types';
import { ElementRef } from '@angular/core';
import { appConfig } from '../app.config';

const selectedPointMock = vi.fn<() => SelectedPoint | null>(() => {
  return { relative: { x: 0, y: 0 }, absolute: { x: 0, y: 0 }, natural: { x: 0, y: 0 } };
});

const renderComponent = async () => {
  // The `providers` prop is provided at the module level ('root')
  // https://testing-library.com/docs/angular-testing-library/api#providers
  return await render(CharacterSelector, {
    providers: appConfig.providers,
    inputs: {
      containerElementRef: new ElementRef(new Image()),
      selectedPoint: selectedPointMock(),
      characters: [],
    },
  });
};

describe('CharacterSelector', () => {
  afterEach(vi.clearAllMocks);

  it('should not render anything if the given `selectedPoint` is `null`', async () => {
    selectedPointMock.mockImplementationOnce(() => null);
    const { container } = await renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('should render character selector if given a `selectedPoint`', async () => {
    await renderComponent();
    expect(screen.getByLabelText(/selector menu/i)).toBeVisible();
    expect(screen.getByLabelText(/selector marker/i)).toBeVisible();
    expect(screen.getByLabelText(/character selector$/i)).toBeVisible();
  });
});
