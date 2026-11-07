import { Component, inject, input, output, signal } from '@angular/core';
import { ApiService } from '../core/api';
import { toApiError, translateError } from '../core/api-error';
import { I18nService } from '../core/i18n';

@Component({
  selector: 'app-return-button',
  template: `
    @let t = i18n.t();
    <div>
      <button type="button" class="pill-btn" [disabled]="pending()" (click)="returnLoan()">
        {{ pending() ? t.common.saving : t.details.returnBook }}
      </button>
      @if (error(); as e) {
        <p class="error-text mx-4">{{ translateError(e, t.errors) }}</p>
      }
    </div>
  `,
})
export class ReturnButton {
  protected readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);

  readonly loanId = input.required<number>();
  readonly done = output<void>();

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly translateError = translateError;

  protected async returnLoan(): Promise<void> {
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.api.returnLoan(this.loanId());
      this.done.emit();
    } catch (e) {
      this.error.set(toApiError(e).code);
    } finally {
      this.pending.set(false);
    }
  }
}
