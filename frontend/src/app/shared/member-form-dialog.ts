import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api';
import { toApiError, translateError } from '../core/api-error';
import { I18nService } from '../core/i18n';
import { Member } from '../core/models';
import { Modal } from './modal';

/** زر + حوار لإضافة عضو (بدون member) أو تعديله (مع member). */
@Component({
  selector: 'app-member-form-dialog',
  imports: [ReactiveFormsModule, Modal],
  template: `
    @let t = i18n.t();
    <button type="button" class="pill-btn" (click)="show()">
      {{ member() ? t.common.edit : t.members.addMember }}
    </button>

    <app-modal [title]="member() ? t.details.editMember : t.members.addMemberTitle">
      <form [formGroup]="form" (ngSubmit)="submit()" ngNativeValidate class="flex flex-col gap-3">
        <input class="field" formControlName="name" [placeholder]="t.members.namePlaceholder" required />
        <input class="field" type="email" formControlName="email" [placeholder]="t.members.emailPlaceholder" required />

        @if (member()) {
          <label class="flex items-center gap-2">
            <input type="checkbox" formControlName="active" class="size-4" />
            {{ t.details.activeLabel }}
          </label>
        }

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
export class MemberFormDialog {
  protected readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly member = input<Member>();
  readonly saved = output<void>();
  protected readonly modal = viewChild.required(Modal);

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    active: [true],
  });

  protected show(): void {
    const m = this.member();
    this.error.set(null);
    if (m) this.form.reset({ name: m.name, email: m.email, active: m.active });
    else this.form.reset({ name: '', email: '', active: true });
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
      const m = this.member();
      if (m) {
        await this.api.updateMember(m.id, { name: v.name.trim(), email: v.email.trim(), active: v.active });
      } else {
        await this.api.createMember({ name: v.name.trim(), email: v.email.trim() });
      }
      this.modal().close();
      this.saved.emit();
    } catch (e) {
      this.error.set(toApiError(e).code);
    } finally {
      this.pending.set(false);
    }
  }
}
