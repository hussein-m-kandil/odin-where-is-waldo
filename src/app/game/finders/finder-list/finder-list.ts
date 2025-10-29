import { Component, inject, input, signal } from '@angular/core';
import { Finder } from '../finders.types';
import { Finders } from '../finders';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-finder-list',
  imports: [],
  templateUrl: './finder-list.html',
  styles: ``,
})
export class FinderList {
  private readonly _finders = inject(Finders);

  readonly class = input<string | string[] | Record<string, unknown>>('');
  readonly style = input<string | Record<string, unknown>>('');

  protected readonly finders = signal<Finder[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  constructor() {
    this.loadFinders();
  }

  protected loadFinders() {
    this.loading.set(true);
    this.error.set(false);
    this._finders
      .getAllFinders()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (finders) => this.finders.set(finders),
        error: () => this.error.set(true),
      });
  }

  protected formatDuration(seconds: number): {
    unit: `${'day' | 'hour' | 'minute' | 'second'}${'s' | ''}`;
    value: number;
  } {
    let result = { value: seconds, unit: 'second' } as ReturnType<typeof this.formatDuration>;
    const M = 60;
    const H = 60 * M;
    const D = 24 * H;
    if (seconds >= D) result = { value: Math.round(seconds / D), unit: 'day' };
    else if (seconds >= H) result = { value: Math.round(seconds / H), unit: 'hour' };
    else if (seconds >= M) result = { value: Math.round(seconds / M), unit: 'minute' };
    result.unit += result.value !== 1 ? 's' : '';
    return result;
  }
}
