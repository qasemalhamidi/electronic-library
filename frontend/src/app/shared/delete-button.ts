import { Component, inject, input, signal, viewChild } from '@angular/core';
import { toApiError, translateError } from '../core/api-error';
import { I18nService } from '../core/i18n';
import { Modal } from './modal';

/** زر حذف مع حوار تأكيد. ‏action تُنفَّذ عند التأكيد ويُعرض أي خطأ داخل الحوار. */
@Component({
  selector: 'app-delete-button',
  imports: [Modal],
  template: `
    @let t = i18n.t();
    <button type="button" class="btn-danger" (click)="show()">{{ t.common.delete }}</button>

    <app-modal [title]="title()">
      <p class="mb-3">{{ t.details.cannotUndo }}</p>
      @if (error(); as e) {
        <p class="error-text mb-3">{{ translateError(e, t.errors) }}</p>
      }
      <div class="mt-1 flex justify-end gap-2">
        <button type="button" class="btn-danger-save" [disabled]="pending()" (click)="confirm()">
          {{ pending() ? t.common.deleting : t.common.delete }}
        </button>
        <button type="button" class="btn-cancel" (click)="modal().close()">{{ t.common.cancel }}</button>
      </div>
    </app-modal>
  `,
})
export class DeleteButton {
  protected readonly i18n = inject(I18nService);

  readonly title = input.required<string>();
  readonly action = input.required<() => Promise<unknown>>();
  protected readonly modal = viewChild.required(Modal);

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly translateError = translateError;

  protected show(): void {
    this.error.set(null);
    this.modal().open();
  }

  protected async confirm(): Promise<void> {
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.action()();
      this.modal().close();
    } catch (e) {
      this.error.set(toApiError(e).code);
    } finally {
      this.pending.set(false);
    }
  }
}
