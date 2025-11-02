import { render, RenderComponentOptions, screen } from '@testing-library/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { findersMock } from '../finders.mock';
import { FinderForm } from './finder-form';
import { Finders } from '../finders';
import { throwError } from 'rxjs';
import { finder } from '../../../../test/utils';
import { HttpErrorResponse } from '@angular/common/http';

const renderComponent = ({
  providers,
  inputs,
  ...resOptions
}: RenderComponentOptions<FinderForm> = {}) => {
  return render(FinderForm, {
    providers: [
      provideZonelessChangeDetection(),
      { provide: Finders, useValue: findersMock },
      ...(providers || []),
    ],
    inputs: { finder, ...(inputs || {}) },
    ...resOptions,
  });
};

describe('FinderForm', () => {
  afterEach(vi.resetAllMocks);

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

  it('should render a finder form', async () => {
    await renderComponent();
    expect(screen.getByRole('form', { name: /finder form/i })).toBeVisible();
  });

  it('should render a required name input', async () => {
    await renderComponent();
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    expect(nameInput).toBeVisible();
    expect(nameInput).toHaveValue('');
    expect(nameInput).toHaveAttribute('required');
    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(nameInput).not.toHaveClass(/border-red/, /border-green/);
  });

  it('should render an invalid name input after clearing whatever typed in it, without displaying error', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.clear(screen.getByRole('textbox', { name: /name/i }));
    expect(screen.getByRole('textbox', { name: /name/i })).not.toBeValid();
    expect(screen.queryByText(/something.* wrong/i)).toBeNull();
  });

  it('should render a disabled submit/save button', async () => {
    await renderComponent();
    const button = screen.getByRole('button', { name: /(submit)|(save)/i });
    expect(button).toBeVisible();
    expect(button).toBeDisabled();
    expect(button).toHaveProperty('type', 'submit');
  });

  it('should enable the submit button after filling the name input', async () => {
    const user = userEvent.setup();
    await renderComponent();
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeEnabled();
  });

  it('should render network error message, invalidate input, and disable submit button', async () => {
    const user = userEvent.setup();
    await renderComponent();
    findersMock.updateFinder.mockImplementationOnce(() => throwError(() => new ProgressEvent('$')));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
    expect(screen.getByText(/something.* wrong.* connection/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInvalid();
  });

  it('should render a message for unknown error, invalidate input, and disable submit button', async () => {
    const user = userEvent.setup();
    await renderComponent();
    findersMock.updateFinder.mockImplementationOnce(() =>
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'internal server error' }))
    );
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
    expect(screen.getByText(/something.* wrong[^(.* connection)]/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInvalid();
  });

  it('should render an error message from the response, invalidate input, and disable submit button', async () => {
    const user = userEvent.setup();
    await renderComponent();
    const message = 'Fake error message';
    const zodIssues = [
      { path: ['foo'], message: 'bar' },
      { path: ['name'], message },
    ];
    const errors = [message, { message }, { error: message }, { error: { message } }, zodIssues];
    for (const error of errors) {
      findersMock.updateFinder.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400, error }))
      );
      await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
      await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
      expect(screen.getByText(message)).toBeVisible();
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInvalid();
      expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeDisabled();
    }
  });

  it('should clear errors (render a clean form) after a valid change have been occur on the name input', async () => {
    const user = userEvent.setup();
    await renderComponent();
    const message = 'Fake error message';
    findersMock.updateFinder.mockImplementationOnce(() =>
      throwError(() => new HttpErrorResponse({ status: 400, error: { message } }))
    );
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'y');
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /name/i })).toBeValid();
    expect(screen.queryByText(message)).toBeNull();
  });

  it('should keep errors after an invalid change have been occur on the name input', async () => {
    const user = userEvent.setup();
    const message = 'Fake error message';
    await renderComponent();
    findersMock.updateFinder.mockImplementationOnce(() =>
      throwError(() => new HttpErrorResponse({ status: 400, error: { message } }))
    );
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
    await user.clear(screen.getByRole('textbox', { name: /name/i }));
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInvalid();
    expect(screen.queryByText(message)).toBeNull();
  });

  it('should emit `submitted` event on successful submit, and reset the form', async () => {
    const handleSubmittedMock = vi.fn();
    const user = userEvent.setup();
    await renderComponent({ on: { submitted: handleSubmittedMock } });
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'x');
    await user.click(screen.getByRole('button', { name: /(submit)|(save)/i }));
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    expect(handleSubmittedMock).toHaveBeenCalledOnce();
    expect(nameInput).toHaveValue('');
    expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText(/something.* wrong/i)).toBeNull();
    expect(nameInput).not.toHaveClass(/border-red/, /border-green/);
    expect(screen.getByRole('button', { name: /(submit)|(save)/i })).toBeDisabled();
  });
});
