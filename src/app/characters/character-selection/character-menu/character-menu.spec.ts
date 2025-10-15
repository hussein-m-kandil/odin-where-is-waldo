import { afterEach, describe, expect, it, vi } from 'vitest';
import { CharacterSelection } from '../character-selection';
import { render, screen } from '@testing-library/angular';
import { CharacterMenu } from './character-menu';
import { appConfig } from '../../../app.config';

const mockCharacterSelection = vi.fn<() => Partial<InstanceType<typeof CharacterSelection>>>(() => {
  const x = 0;
  const y = 0;
  return { selectedPoint: { absolute: { x, y }, relative: { x, y }, natural: { x, y } } };
});

const renderComponent = async () => {
  return await render(CharacterMenu, {
    providers: [
      ...appConfig.providers,
      { provide: CharacterSelection, useValue: mockCharacterSelection() },
    ],
  });
};

describe('CharacterMenu', () => {
  afterEach(vi.clearAllMocks);

  it('should not render anything if the given `selectedPoint` is `null`', async () => {
    mockCharacterSelection.mockImplementationOnce(() => ({ selectedPoint: null }));
    const { container } = await renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('should render character selector if given a `selectedPoint`', async () => {
    await renderComponent();
    expect(screen.getByLabelText(/menu/i)).toBeVisible();
    screen.getByLabelText(/marker/i);
  });
});
