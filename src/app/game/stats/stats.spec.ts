import { render, RenderComponentOptions, screen } from '@testing-library/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { Stats } from './stats';

const renderComponent = async (options: RenderComponentOptions<Stats> = {}) => {
  const { providers, ...restOptions } = options;
  return await render(Stats, {
    providers: [provideZonelessChangeDetection(), ...(providers || [])],
    ...restOptions,
  });
};

describe('Stats', () => {
  it('should have 0 elapsed seconds, and 0 found characters by default', async () => {
    await renderComponent();
    expect(screen.getByText(/elapsed seconds/i)).toHaveTextContent('Elapsed seconds: 0');
    expect(screen.getByText(/found characters/i)).toHaveTextContent('Found characters: 0');
  });

  it('should have the give number of found seconds/characters', async () => {
    const secNum = 17;
    const charNum = 3;
    await renderComponent({ inputs: { elapsedSeconds: secNum, foundCharacters: charNum } });
    expect(screen.getByText(/elapsed seconds/i)).toHaveTextContent(`Elapsed seconds: ${secNum}`);
    expect(screen.getByText(/found characters/i)).toHaveTextContent(`Found characters: ${charNum}`);
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
