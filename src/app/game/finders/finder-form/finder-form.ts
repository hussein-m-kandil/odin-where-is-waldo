import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, input, output } from '@angular/core';
import { Finders } from '../finders';
import { Finder } from '../finders.types';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-finder-form',
  imports: [ReactiveFormsModule],
  templateUrl: './finder-form.html',
  styles: ``,
})
export class FinderForm {
  readonly class = input<string | string[] | Record<string, unknown>>('');
  readonly style = input<string | Record<string, unknown>>('');
  readonly finder = input.required<Finder>();

  readonly submitted = output<Finder>();

  private readonly _finders = inject(Finders);
  private readonly _formBuilder = inject(FormBuilder);

  protected readonly form = this._formBuilder.nonNullable.group({
    name: ['', Validators.required],
  });

  protected onSubmit() {
    const value = this.form.getRawValue();
    if (value.name) {
      this._finders.updateFinder(this.finder().id, value).subscribe({
        next: (updatedFinder) => {
          this.submitted.emit(updatedFinder);
          this.form.reset();
        },
        error: (data) => {
          let message = 'Something went wrong, review the entered data and try again';
          if (data instanceof HttpErrorResponse) {
            if (data.error) {
              const { error } = data;
              if (error.error) {
                if (typeof error.error === 'string') message = error.error;
                else if (typeof error.error.message === 'string') message = error.error.message;
              } else if (typeof error.message === 'string') message = error.message;
              else if (typeof error === 'string') message = error;
              else if (Array.isArray(error)) {
                const nameZodIssue = error.find((issue) => {
                  return Array.isArray(issue.path) && (issue.path as string[]).includes('name');
                });
                if (nameZodIssue && typeof nameZodIssue.message === 'string') {
                  message = nameZodIssue.message;
                }
              }
            }
          } else {
            message = 'Something went wrong, check your internet connection and try again';
          }
          this.form.controls.name.setErrors({ resErr: { message } });
        },
      });
    }
  }
}
