import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth';
import { I18nService } from '../core/i18n';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    @let t = i18n.t();
    <footer class="mt-12 bg-brand px-6 pt-8 pb-4 text-white">
      <div class="mx-auto flex max-w-[960px] flex-wrap justify-between gap-6">
        <div>
          <h3 class="mb-1 text-[1.2rem] text-white">{{ t.nav.title }}</h3>
          <p class="text-[0.9rem] text-white/80">{{ t.footer.tagline }}</p>
        </div>

        <div>
          <h4 class="mb-2 text-white">{{ t.footer.quickLinks }}</h4>
          <ul class="flex list-none flex-col gap-1.5 text-[0.9rem] [&_a]:text-white/85 [&_a]:hover:text-white [&_a]:hover:underline">
            <li><a routerLink="/">{{ t.nav.home }}</a></li>
            <li><a routerLink="/books">{{ t.nav.books }}</a></li>
            @if (auth.isStaff()) {
              <li><a routerLink="/members">{{ t.nav.members }}</a></li>
            }
          </ul>
        </div>
      </div>

      <p class="mx-auto mt-6 max-w-[960px] border-t border-white/25 pt-4 text-center text-[0.85rem] text-white/75">
        © <bdi>{{ year }}</bdi> {{ t.nav.title }}. {{ t.footer.rights }}
      </p>
    </footer>
  `,
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly year = new Date().getFullYear();
}
