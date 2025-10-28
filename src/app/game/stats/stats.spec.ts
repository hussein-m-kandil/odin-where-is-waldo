import { render, RenderComponentOptions, screen } from '@testing-library/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { Stats } from './stats';

const renderComponent = async (options: RenderComponentOptions<Stats> = {}) => {
  const { providers, ...restOptions } = options;
  return await render(Stats, {
    providers: [provideZonelessChangeDetection(), ...(providers || [])],
    ...restOptions,
  });
};

const assertTimerValue = (v: number) => {
  expect(screen.getByRole('timer')).toHaveTextContent(new RegExp(`Elapsed seconds: ${v}`, 'i'));
};

describe('Stats', () => {
  it('should have a timer with a value of 0 at start', async () => {
    vi.useFakeTimers();
    await renderComponent();
    assertTimerValue(0);
    vi.useRealTimers();
  });

  it('should have a timer increments by 1 every second', async () => {
    vi.useFakeTimers();
    await renderComponent();
    for (let i = 0; i < 7; i++) {
      assertTimerValue(i);
      await vi.advanceTimersByTimeAsync(900);
      assertTimerValue(i);
      await vi.advanceTimersByTimeAsync(105);
      assertTimerValue(i + 1);
    }
    vi.useRealTimers();
  });

  it('should have 0 found characters by default', async () => {
    await renderComponent();
    expect(screen.getByText(/found characters/i)).toHaveTextContent('Found characters: 0');
  });

  it('should have the give number of found characters', async () => {
    const num = 3;
    await renderComponent({ inputs: { foundCharacters: num } });
    expect(screen.getByText(/found characters/i)).toHaveTextContent(`Found characters: ${num}`);
  });

  it('should have the given class', async () => {
    const className = 'blah';
    const { container } = await renderComponent({ inputs: { class: className } });
    expect(container.firstElementChild).toHaveClass(className);
  });

  it('should have the given array of classes', async () => {
    const classNames = ['foo', 'bar', 'tar'];
    const { container } = await renderComponent({ inputs: { class: classNames } });
    for (const cn of classNames) {
      expect(container.firstElementChild).toHaveClass(cn);
    }
  });

  it('should apply the given class record', async () => {
    const classRecord = { 'p-8': true, flex: false };
    const { container } = await renderComponent({ inputs: { class: classRecord } });
    expect(container.firstElementChild).toHaveClass('p-8');
    expect(container.firstElementChild).not.toHaveClass('flex');
  });

  it('should have the given style', async () => {
    const style = 'background-color: #eee;';
    const { container } = await renderComponent({ inputs: { style } });
    expect(container.firstElementChild).toHaveStyle(style);
  });

  it('should have the given style record', async () => {
    const style = { 'background-color': '#eee' };
    const { container } = await renderComponent({ inputs: { style } });
    expect(container.firstElementChild).toHaveStyle(style);
  });
});
