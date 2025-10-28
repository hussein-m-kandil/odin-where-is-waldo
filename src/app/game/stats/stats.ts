import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { interval, map } from 'rxjs';

@Component({
  selector: 'app-stats',
  imports: [AsyncPipe],
  templateUrl: './stats.html',
  styles: ``,
})
export class Stats {
  readonly class = input<string | string[] | Record<string, unknown>>('');
  readonly style = input<string | Record<string, unknown>>();
  readonly foundCharacters = input(0);

  protected readonly timer$ = interval(1000).pipe(map((n) => n + 1));
}
