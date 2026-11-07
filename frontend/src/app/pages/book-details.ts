import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api';
import { isAuthError } from '../core/api-error';
import { AuthService } from '../core/auth';
import { I18nService } from '../core/i18n';
import { Book, Loan, Member } from '../core/models';
import { BookCard } from '../shared/book-card';
import { BookFormDialog } from '../shared/book-form-dialog';
import { BorrowDialog } from '../shared/borrow-dialog';
import { DeleteButton } from '../shared/delete-button';
import { ReturnButton } from '../shared/return-button';
import { ErrorState, Loading, NotFound } from '../shared/status';

@Component({
  selector: 'app-book-details',
  imports: [RouterLink, BookCard, BookFormDialog, BorrowDialog, ReturnButton, DeleteButton, Loading, ErrorState, NotFound],
  template: `
    @let t = i18n.t();
    @switch (state()) {
      @case ('loading') { <app-loading /> }
      @case ('error') { <app-error-state (retry)="load(false)" /> }
      @case ('notfound') { <app-not-found /> }
      @case ('ready') {
        @let b = book()!;
        <main>
          <app-book-card [book]="b" />

          @if (auth.isStaff()) {
            <div class="flex flex-wrap items-center">
              @if (b.available) {
                <app-borrow-dialog [bookId]="b.id" [members]="activeMembers()" (done)="load(true)" />
              } @else if (loan(); as l) {
                <app-return-button [loanId]="l.id" (done)="load(true)" />
              }
              <app-book-form-dialog [book]="b" (saved)="load(true)" />
              <app-delete-button [title]="t.details.deleteBook" [action]="deleteAction" />
            </div>

            @if (loan(); as l) {
              @if (borrower(); as m) {
                <p class="m-4 flex w-[310px] max-w-full justify-between rounded-[10px] border border-brand px-[18px] py-1 text-black">
                  <span>{{ t.details.borrowedBy }}:</span>
                  <a class="text-brand" [routerLink]="['/members', m.id]">{{ m.name }}</a>
                  <span>{{ t.details.since }} <bdi>{{ l.borrowedAt.slice(0, 10) }}</bdi></span>
                </p>
              }
            }

            <section class="section-pad">
              <h2>{{ t.details.loanHistory }}</h2>
              @if (history().length === 0) {
                <p>{{ t.details.neverBorrowed }}</p>
              } @else {
                <ul class="history">
                  @for (lo of history(); track lo.id) {
                    <li>
                      <a [routerLink]="['/members', lo.memberId]">
                        {{ memberName(lo.memberId) ?? t.details.memberFallback + ' #' + lo.memberId }}
                      </a>
                      — {{ t.details.borrowedOn }} <bdi>{{ lo.borrowedAt.slice(0, 10) }}</bdi> ·
                      @if (lo.returnedAt) {
                        {{ t.details.returnedOn }} <bdi>{{ lo.returnedAt.slice(0, 10) }}</bdi>
                      } @else {
                        {{ t.details.notReturned }}
                      }
                    </li>
                  }
                </ul>
              }
            </section>
          }

          <a routerLink="/books" class="pill-link m-4">
            {{ i18n.dir() === 'rtl' ? '→' : '←' }} {{ t.details.backToBooks }}
          </a>
        </main>
      }
    }
  `,
})
export class BookDetails {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly state = signal<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  protected readonly book = signal<Book | null>(null);
  private readonly members = signal<Member[]>([]);
  private readonly loans = signal<Loan[]>([]);

  protected readonly activeMembers = computed(() => this.members().filter((m) => m.active));
  protected readonly loan = computed(() => {
    const b = this.book();
    return this.loans().find((lo) => lo.bookId === b?.id && !lo.returnedAt);
  });
  protected readonly borrower = computed(() => {
    const l = this.loan();
    return l ? this.members().find((m) => m.id === l.memberId) : undefined;
  });
  protected readonly history = computed(() => {
    const b = this.book();
    return this.loans()
      .filter((lo) => lo.bookId === b?.id)
      .sort((a, c) => c.id - a.id);
  });

  protected readonly deleteAction = async () => {
    await this.api.deleteBook(Number(this.id()));
    await this.router.navigateByUrl('/books');
  };

  constructor() {
    effect(() => {
      this.id();
      untracked(() => void this.load(false));
    });
  }

  protected memberName(id: number): string | undefined {
    return this.members().find((m) => m.id === id)?.name;
  }

  protected async load(silent: boolean): Promise<void> {
    if (!silent) this.state.set('loading');
    try {
      const book = await this.api.getBook(Number(this.id()));
      if (!book) {
        this.state.set('notfound');
        return;
      }
      const staff = this.auth.isStaff();
      const [members, loans] = staff
        ? await Promise.all([this.api.getMembers(), this.api.getLoans()])
        : [[] as Member[], [] as Loan[]];

      this.book.set(book);
      this.members.set(members);
      this.loans.set(loans);
      this.state.set('ready');
    } catch (e) {
      if (!isAuthError(e)) this.state.set('error');
    }
  }
}
