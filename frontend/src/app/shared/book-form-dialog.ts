import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api';
import { toApiError, translateError } from '../core/api-error';
import { I18nService } from '../core/i18n';
import { Book } from '../core/models';
import { Modal } from './modal';

/** زر + حوار لإضافة كتاب (بدون book) أو تعديله (مع book). */
@Component({
  selector: 'app-book-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  template: `
    @let t = i18n.t();
    <button type="button" class="pill-btn" (click)="show()">
      {{ book() ? t.common.edit : t.books.addBook }}
    </button>

    <app-modal [title]="book() ? t.details.editBook : t.books.addBookTitle">
      <form [formGroup]="form" (ngSubmit)="submit()" ngNativeValidate class="flex flex-col gap-3">
        <input class="field" formControlName="title" [placeholder]="t.books.titlePlaceholder" required />
        <input class="field" formControlName="author" [placeholder]="t.books.authorPlaceholder" required />
        <input class="field" formControlName="category" [placeholder]="t.books.categoryPlaceholder" required />
        <input class="field" type="number" formControlName="year" [placeholder]="t.books.yearPlaceholder" required />

        @if (error(); as e) {
          <p class="error-text">{{ translate(e) }}</p>
        }

        <div class="mt-1 flex justify-end gap-2">
          <button type="submit" class="btn-save" [disabled]="pending()">
            {{ pending() ? t.common.saving : t.common.save }}
          </button>
          <button type="button" class="btn-cancel" (click)="modal().close()">{{ t.common.cancel }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class BookFormDialog {
  protected readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly book = input<Book>();
  readonly saved = output<void>();
  protected readonly modal = viewChild.required(Modal);

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    category: ['', Validators.required],
    year: this.fb.control<number | null>(null, Validators.required),
  });

  protected show(): void {
    const b = this.book();
    this.error.set(null);
    if (b) this.form.reset({ title: b.title, author: b.author, category: b.category, year: b.year });
    else this.form.reset();
    this.modal().open();
  }

  protected translate(code: string): string {
    return translateError(code, this.i18n.t().errors);
  }

  protected async submit(): Promise<void> {
    this.pending.set(true);
    this.error.set(null);
    try {
      const v = this.form.getRawValue();
      const payload = {
        title: v.title.trim(),
        author: v.author.trim(),
        category: v.category.trim(),
        year: Number(v.year),
      };
      const b = this.book();
      if (b) await this.api.updateBook(b.id, payload);
      else await this.api.createBook(payload);
      this.modal().close();
      this.saved.emit();
    } catch (e) {
      this.error.set(toApiError(e).code);
    } finally {
      this.pending.set(false);
    }
  }
}
