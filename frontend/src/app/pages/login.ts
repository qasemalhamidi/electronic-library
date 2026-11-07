import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toApiError, translateError } from '../core/api-error';
import { AuthService } from '../core/auth';
import { I18nService } from '../core/i18n';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    @let t = i18n.t();
    <main>
      <div class="card-box mx-auto my-12 max-w-[380px] p-6">
        <h1 class="mb-4 text-center text-brand">{{ t.login.title }}</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" ngNativeValidate class="flex flex-col gap-3">
          <input class="field" type="email" formControlName="email" [placeholder]="t.login.email" autocomplete="email" required />
          <input class="field" type="password" formControlName="password" [placeholder]="t.login.password" autocomplete="current-password" required />

          @if (error(); as e) {
            <p class="error-text">{{ translateError(e, t.errors) }}</p>
          }

          <button type="submit" class="btn-save rounded-md p-2.5" [disabled]="pending()">
            {{ pending() ? t.login.submitting : t.login.submit }}
          </button>
        </form>
      </div>
    </main>
  `,
})
export class Login {
  protected readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly translateError = translateError;

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async submit(): Promise<void> {
    this.pending.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email.trim(), password);
      await this.router.navigateByUrl('/');
    } catch (e) {
      this.error.set(toApiError(e).code);
    } finally {
      this.pending.set(false);
    }
  }
}
