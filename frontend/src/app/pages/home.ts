import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api';
import { isAuthError } from '../core/api-error';
import { AuthService } from '../core/auth';
import { I18nService } from '../core/i18n';
import { Book, Member } from '../core/models';
import { BookCard } from '../shared/book-card';
import { ErrorState, Loading } from '../shared/status';

@Component({
  selector: 'app-home',
  imports: [RouterLink, BookCard, Loading, ErrorState],
  template: `
    @let t = i18n.t();
    @switch (state()) {
      @case ('loading') { <app-loading /> }
      @case ('error') { <app-error-state (retry)="load()" /> }
      @case ('ready') {
        <main>
          <section class="hero">
            <h1>{{ t.home.title }}</h1>
            <p>{{ t.home.subtitle }}</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/books" class="rounded-full bg-white px-[22px] py-2.5 font-semibold text-brand transition-opacity hover:opacity-85">
                {{ t.home.browseBooks }}
              </a>
              @if (auth.isStaff()) {
                <a routerLink="/members" class="rounded-full border-2 border-white px-[22px] py-2.5 font-semibold text-white transition-opacity hover:opacity-85">
                  {{ t.home.viewMembers }}
                </a>
              }
            </div>
          </section>

          <section class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 px-4 pt-6">
            @for (s of stats(); track s.label) {
              <div class="flex flex-col items-center rounded-[10px] border border-[#ddd] bg-white px-4 py-5 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                <span class="text-[2rem] font-bold text-brand">{{ s.value }}</span>
                <span class="text-[0.9rem] text-[#444]">{{ s.label }}</span>
              </div>
            }
          </section>

          <section class="px-4 py-6">
            <h2 class="mb-2 text-brand">{{ t.home.featured }}</h2>
            <div class="grid-cards py-4">
              @for (book of featured(); track book.id) {
                <app-book-card [book]="book" />
              }
            </div>
            <a routerLink="/books" class="font-semibold text-brand hover:underline">
              {{ t.home.viewAll }} {{ i18n.dir() === 'rtl' ? '←' : '→' }}
            </a>
          </section>
        </main>
      }
    }
  `,
})
export class Home {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  private readonly books = signal<Book[]>([]);
  private readonly members = signal<Member[]>([]);

  protected readonly featured = computed(() => this.books().slice(0, 3));
  protected readonly stats = computed(() => {
    const t = this.i18n.t();
    const list = [
      { label: t.home.totalBooks, value: this.books().length },
      { label: t.home.availableBooks, value: this.books().filter((b) => b.available).length },
    ];
    if (this.auth.isStaff()) list.push({ label: t.home.members, value: this.members().length });
    return list;
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.state.set('loading');
    try {
      const [books, members] = await Promise.all([
        this.api.getBooks(),
        this.auth.isStaff() ? this.api.getMembers() : Promise.resolve([] as Member[]),
      ]);
      this.books.set(books);
      this.members.set(members);
      this.state.set('ready');
    } catch (e) {
      if (!isAuthError(e)) this.state.set('error');
    }
  }
}
