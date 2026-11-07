import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api';
import { toApiError, translateError } from '../core/api-error';
import { I18nService } from '../core/i18n';
import { Member } from '../core/models';
import { Modal } from './modal';

@Component({
  selector: 'app-borrow-dialog',
  imports: [ReactiveFormsModule, Modal],
  template: `
    @let t = i18n.t();
    <button type="button" class="pill-btn" (click)="show()">{{ t.details.borrow }}</button>

    <app-modal [title]="t.details.borrowBook">
      <form [formGroup]="form" (ngSubmit)="submit()" ngNativeValidate class="flex flex-col gap-3">
        <select class="field" formControlName="memberId" required>
          <option value="" disabled>{{ t.details.selectMember }}</option>
          @for (m of members(); track m.id) {
            <option [value]="m.id">{{ m.name }}</option>
          }
        </select>

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
export class BorrowDialog {
  protected readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly bookId = input.required<number>();
  readonly members = input.required<Member[]>();
  readonly done = output<void>();
  protected readonly modal = viewChild.required(Modal);

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({ memberId: ['', Validators.required] });

  protected show(): void {
    this.error.set(null);
    this.form.reset({ memberId: '' });
    this.modal().open();
  }

  protected translate(code: string): string {
    return translateError(code, this.i18n.t().errors);
  }

  protected async submit(): Promise<void> {
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.api.borrowBook(this.bookId(), Number(this.form.getRawValue().memberId));
      this.modal().close();
      this.done.emit();
    } catch (e) {
      this.error.set(toApiError(e).code);
    } finally {
      this.pending.set(false);
    }
  }
}
