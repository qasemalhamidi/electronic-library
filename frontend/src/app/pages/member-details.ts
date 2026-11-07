import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api';
import { isAuthError } from '../core/api-error';
import { I18nService } from '../core/i18n';
import { Book, Loan, Member } from '../core/models';
import { BookCard } from '../shared/book-card';
import { DeleteButton } from '../shared/delete-button';
import { MemberCard } from '../shared/member-card';
import { MemberFormDialog } from '../shared/member-form-dialog';
import { ErrorState, Loading, NotFound } from '../shared/status';

@Component({
  selector: 'app-member-details',
  imports: [RouterLink, MemberCard, BookCard, MemberFormDialog, DeleteButton, Loading, ErrorState, NotFound],
  template: `
    @let t = i18n.t();
    @switch (state()) {
      @case ('loading') { <app-loading /> }
      @case ('error') { <app-error-state (retry)="load(false)" /> }
      @case ('notfound') { <app-not-found /> }
      @case ('ready') {
        @let m = member()!;
        <main>
          <app-member-card [member]="m" />

          <div class="flex flex-wrap items-center">
            <app-member-form-dialog [member]="m" (saved)="load(true)" />
            <app-delete-button [title]="t.details.deleteMember" [action]="deleteAction" />
          </div>

          <section class="section-pad">
            <h2>{{ t.details.currentlyBorrowed }}</h2>
            @if (currentBooks().length === 0) {
              <p>{{ t.details.noBorrowed }}</p>
            } @else {
              <div class="grid-cards">
                @for (book of currentBooks(); track book.id) {
                  <app-book-card [book]="book" />
                }
              </div>
            }
          </section>

          <section class="section-pad">
            <h2>{{ t.details.returnedBooks }}</h2>
            @if (returnedLoans().length === 0) {
              <p>{{ t.details.noReturned }}</p>
            } @else {
              <ul class="history">
                @for (lo of returnedLoans(); track lo.id) {
                  <li>
                    <a [routerLink]="['/books', lo.bookId]">
                      {{ bookTitle(lo.bookId) ?? t.details.bookFallback + ' #' + lo.bookId }}
                    </a>
                    — {{ t.details.borrowedOn }} <bdi>{{ lo.borrowedAt.slice(0, 10) }}</bdi>
                    · {{ t.details.returnedOn }} <bdi>{{ lo.returnedAt?.slice(0, 10) }}</bdi>
                  </li>
                }
              </ul>
            }
          </section>

          <a routerLink="/members" class="pill-link m-4">
            {{ i18n.dir() === 'rtl' ? '→' : '←' }} {{ t.details.backToMembers }}
          </a>
        </main>
      }
    }
  `,
})
export class MemberDetails {
  protected readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly state = signal<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  protected readonly member = signal<Member | null>(null);
  private readonly loans = signal<Loan[]>([]);
  private readonly books = signal<Book[]>([]);

  private readonly memberLoans = computed(() => this.loans().filter((lo) => lo.memberId === this.member()?.id));

  protected readonly currentBooks = computed(() => {
    const byId = new Map(this.books().map((b) => [b.id, b]));
    return this.memberLoans()
      .filter((lo) => !lo.returnedAt)
      .map((lo) => byId.get(lo.bookId))
      .filter((b): b is Book => !!b);
  });

  protected readonly returnedLoans = computed(() =>
    this.memberLoans()
      .filter((lo) => lo.returnedAt)
      .sort((a, b) => b.id - a.id),
  );

  protected readonly deleteAction = async () => {
    await this.api.deleteMember(Number(this.id()));
    await this.router.navigateByUrl('/members');
  };

  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.load(false));
    });
  }

  protected bookTitle(id: number): string | undefined {
    return this.books().find((b) => b.id === id)?.title;
  }

  protected async load(silent: boolean): Promise<void> {
    if (!silent) this.state.set('loading');
    try {
      const member = await this.api.getMember(Number(this.id()));
      if (!member) {
        this.state.set('notfound');
        return;
      }
      const [loans, books] = await Promise.all([this.api.getLoans(), this.api.getBooks()]);
      this.member.set(member);
      this.loans.set(loans);
      this.books.set(books);
      this.state.set('ready');
    } catch (e) {
      if (!isAuthError(e)) this.state.set('error');
    }
  }
}
