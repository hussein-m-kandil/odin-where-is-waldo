import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.html',
  styles: ``,
})
export class Stats {
  readonly class = input<string | string[] | Record<string, unknown>>('');
  readonly style = input<string | Record<string, unknown>>();
  readonly foundCharacters = input(0);
  readonly elapsedSeconds = input(0);
}
