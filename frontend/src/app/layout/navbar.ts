import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth';
import { I18nService } from '../core/i18n';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    @let t = i18n.t();
    <nav class="flex items-center justify-between gap-4 bg-brand px-6 py-3 max-sm:flex-col max-sm:gap-2 max-sm:px-3">
      <h2 class="m-0 text-[1.4rem] text-white">{{ t.nav.title }}</h2>

      <div class="flex flex-row flex-wrap items-center gap-2 max-sm:justify-center">
        <a class="nav-link" routerLink="/" routerLinkActive="nav-link-active" [routerLinkActiveOptions]="{ exact: true }">
          {{ t.nav.home }}
        </a>
        <a class="nav-link" routerLink="/books" routerLinkActive="nav-link-active">{{ t.nav.books }}</a>
        @if (auth.isStaff()) {
          <a class="nav-link" routerLink="/members" routerLinkActive="nav-link-active">{{ t.nav.members }}</a>
        }

        <button type="button" class="lang-btn" (click)="i18n.toggle()">
          {{ i18n.locale() === 'ar' ? 'English' : 'العربية' }}
        </button>

        @if (auth.user()) {
          <button type="button" class="lang-btn" (click)="logout()">{{ t.nav.logout }}</button>
        } @else {
          <a class="nav-link" routerLink="/login" routerLinkActive="nav-link-active">{{ t.nav.login }}</a>
        }
      </div>
    </nav>
  `,
})
export class Navbar {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
