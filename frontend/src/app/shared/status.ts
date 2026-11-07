import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/i18n';

@Component({
  selector: 'app-loading',
  template: `
    <main class="px-4 py-16 text-center">
      <div
        class="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-[#d9eeee] border-t-brand"
        role="status"
        aria-label="Loading"
      ></div>
    </main>
  `,
})
export class Loading {}

@Component({
  selector: 'app-error-state',
  imports: [RouterLink],
  template: `
    @let t = i18n.t();
    <main class="px-4 py-16 text-center">
      <h1 class="mb-2 text-brand">{{ t.status.errorTitle }}</h1>
      <p class="mb-5 text-[#444]">{{ t.status.errorText }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <button class="rounded-full bg-brand px-5 py-2 text-white" (click)="retry.emit()">
          {{ t.common.tryAgain }}
        </button>
        <a routerLink="/" class="rounded-full border border-brand bg-white px-5 py-2 text-brand">
          {{ t.common.goHome }}
        </a>
      </div>
    </main>
  `,
})
export class ErrorState {
  protected readonly i18n = inject(I18nService);
  readonly retry = output<void>();
}

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    @let t = i18n.t();
    <main class="px-4 py-16 text-center">
      <h1 class="mb-2 text-brand">{{ t.status.notFoundTitle }}</h1>
      <p class="mb-5 text-[#444]">{{ t.status.notFoundText }}</p>
      <a routerLink="/" class="rounded-full border border-brand bg-white px-5 py-2 text-brand">
        {{ t.status.backHome }}
      </a>
    </main>
  `,
})
export class NotFound {
  protected readonly i18n = inject(I18nService);
}
