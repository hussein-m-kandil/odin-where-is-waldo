import { render, screen, RenderComponentOptions } from '@testing-library/angular';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { allFinders, finder } from '../../../../test/utils';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { of, delay, throwError } from 'rxjs';
import { FinderList } from './finder-list';
import { Finders } from '../finders';
import { Finder } from '../finders.types';

const finders: Record<keyof Omit<Finders, '_http'>, Mock> = {
  getAllFinders: vi.fn(() => of(allFinders)),
  createFinder: vi.fn(() => of(finder)),
};

const renderComponent = ({
  providers,
  ...restOptions
}: RenderComponentOptions<FinderList> = {}) => {
  return render(FinderList, {
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideZonelessChangeDetection(),
      { provide: Finders, useValue: finders },
      ...(providers || []),
    ],
    ...restOptions,
  });
};

describe('FinderList', () => {
  afterEach(vi.resetAllMocks);

  it('should render heading', async () => {
    await renderComponent();
    expect(screen.getByRole('heading', { name: /finders/i })).toBeVisible();
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

  it('should render loading indicator', async () => {
    finders.getAllFinders.mockImplementationOnce(() => of(allFinders).pipe(delay(1000)));
    await renderComponent();
    expect(screen.getByText(/loading/i)).toBeVisible();
  });

  it('should remove loading indicator when finish', async () => {
    vi.useFakeTimers();
    finders.getAllFinders.mockImplementationOnce(() => of(allFinders).pipe(delay(100)));
    await renderComponent();
    await vi.advanceTimersByTimeAsync(100);
    await vi.runOnlyPendingTimersAsync();
    expect(screen.queryByText(/loading/i)).toBeNull();
    vi.useRealTimers();
  });

  it('should render an error message and try a try-again button', async () => {
    finders.getAllFinders.mockImplementationOnce(() =>
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'internal server error' }))
    );
    await renderComponent();
    expect(screen.queryByText(/could(n't| not)/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /try again/i })).toBeVisible();
  });

  it('should retry loading finders again after clicking the try-again button', async () => {
    finders.getAllFinders.mockImplementationOnce(() =>
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'internal server error' }))
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(finders.getAllFinders).toHaveBeenCalledTimes(2);
  });

  it('should remove the try-again button after a successful retry', async () => {
    finders.getAllFinders.mockImplementationOnce(() =>
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'internal server error' }))
    );
    const user = userEvent.setup();
    await renderComponent();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
  });

  it('should render a table of finders with their data formatted correctly', async () => {
    const genId = () => crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const finderList: Finder[] = [
      { id: genId(), createdAt, updatedAt, name: 'Foo', duration: 1 },
      { id: genId(), createdAt, updatedAt, name: 'Foo', duration: 9 },
      { id: genId(), createdAt, updatedAt, name: 'Bar', duration: 60 },
      { id: genId(), createdAt, updatedAt, name: 'Bar', duration: 7 * 60 },
      { id: genId(), createdAt, updatedAt, name: 'Baz', duration: 60 * 60 },
      { id: genId(), createdAt, updatedAt, name: 'Baz', duration: 5 * 60 * 60 },
      { id: genId(), createdAt, updatedAt, name: 'Tar', duration: 24 * 60 * 60 },
      { id: genId(), createdAt, updatedAt, name: 'Tar', duration: 3 * 24 * 60 * 60 },
    ];
    finders.getAllFinders.mockImplementationOnce(() => of(finderList));
    await renderComponent();
    expect(screen.getByRole('table', { name: /finders/i })).toBeVisible();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(finderList.length * 2);
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: /Duration/i })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Name Duration' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Foo 1 second' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Foo 9 seconds' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Bar 1 minute' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Bar 7 minutes' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Baz 1 hour' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Baz 5 hours' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Tar 1 day' })).toBeVisible();
    expect(screen.getByRole('row', { name: 'Tar 3 days' })).toBeVisible();
  });
});
