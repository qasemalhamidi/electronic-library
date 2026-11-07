import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api';
import { isAuthError } from '../core/api-error';
import { AuthService } from '../core/auth';
import { I18nService } from '../core/i18n';
import { Book } from '../core/models';
import { BookCard } from '../shared/book-card';
import { BookFormDialog } from '../shared/book-form-dialog';
import { ErrorState, Loading } from '../shared/status';

@Component({
  selector: 'app-books',
  imports: [RouterLink, BookCard, BookFormDialog, Loading, ErrorState],
  template: `
    @let t = i18n.t();
    @switch (state()) {
      @case ('loading') { <app-loading /> }
      @case ('error') { <app-error-state (retry)="load()" /> }
      @case ('ready') {
        <main>
          <section class="hero">
            <h1>{{ t.books.title }}</h1>
            <p>{{ t.books.welcome }}</p>
          </section>

          @if (auth.isStaff()) {
            <app-book-form-dialog (saved)="load(true)" />
          }

          <form class="flex gap-2 px-4 pt-4 max-sm:flex-col" (submit)="search($event, searchInput.value)">
            <input
              #searchInput
              type="search"
              class="flex-1 rounded-md border border-[#ccc] bg-white px-3 py-2 sm:max-w-[360px]"
              [placeholder]="t.books.searchPlaceholder"
              [value]="q() ?? ''"
            />
            <button type="submit" class="rounded-md bg-brand px-4 py-2 text-white">{{ t.books.search }}</button>
          </form>

          <div class="flex flex-wrap gap-2 px-4 pt-4">
            <a routerLink="/books" class="filter-pill" [class.filter-pill-active]="!category()">{{ t.books.all }}</a>
            @for (cat of categories(); track cat) {
              <a
                routerLink="/books"
                [queryParams]="{ category: cat }"
                class="filter-pill"
                [class.filter-pill-active]="category() === cat"
              >{{ cat }}</a>
            }
          </div>

          @if (filtered().length === 0) {
            <p class="px-4 pt-4">{{ t.books.noResults }}</p>
          }

          <div class="grid-cards p-4">
            @for (book of filtered(); track book.id) {
              <app-book-card [book]="book" />
            }
          </div>
        </main>
      }
    }
  `,
})
export class Books {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // تُربط تلقائياً من query params (withComponentInputBinding)
  readonly q = input<string>();
  readonly category = input<string>();

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  private readonly books = signal<Book[]>([]);

  protected readonly categories = computed(() => [...new Set(this.books().map((b) => b.category))]);

  protected readonly filtered = computed(() => {
    const t = this.i18n.t();
    const query = this.q()?.trim().toLowerCase() ?? '';
    const category = this.category();

    return this.books().filter((b) => {
      const matchesCategory = !category || b.category === category;
      const searchable = [
        b.title,
        b.author,
        b.category,
        String(b.year),
        b.available ? `available ${t.books.available}` : `borrowed ${t.books.borrowed}`,
      ]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });
  });

  constructor() {
    void this.load();
  }

  protected async load(silent = false): Promise<void> {
    if (!silent) this.state.set('loading');
    try {
      this.books.set(await this.api.getBooks());
      this.state.set('ready');
    } catch (e) {
      if (!isAuthError(e)) this.state.set('error');
    }
  }

  protected search(event: Event, value: string): void {
    event.preventDefault();
    void this.router.navigate(['/books'], {
      queryParams: { q: value.trim() || null, category: this.category() || null },
    });
  }
}
