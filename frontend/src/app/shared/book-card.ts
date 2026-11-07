import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/i18n';
import { Book } from '../core/models';

@Component({
  selector: 'app-book-card',
  imports: [RouterLink],
  template: `
    @let t = i18n.t();
    @let b = book();
    <article class="card-box">
      <h3 class="mb-2.5 text-center text-brand">
        <a [routerLink]="['/books', b.id]" class="hover:font-semibold">{{ b.title }}</a>
      </h3>
      <p class="my-1 text-[#444]">{{ t.books.author }}: {{ b.author }}</p>
      <p class="my-1 text-[#444]">{{ t.books.category }}: {{ b.category }}</p>
      <p class="my-1 text-[#444]">{{ t.books.year }}: {{ b.year }}</p>
      <span class="badge mt-2.5 py-1 text-[0.85rem]" [class]="b.available ? 'bg-ok' : 'bg-danger'">
        {{ b.available ? t.books.available : t.books.borrowed }}
      </span>
    </article>
  `,
})
export class BookCard {
  protected readonly i18n = inject(I18nService);
  readonly book = input.required<Book>();
}
