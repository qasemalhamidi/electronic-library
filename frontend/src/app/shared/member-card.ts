import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/i18n';
import { Member } from '../core/models';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink],
  template: `
    @let t = i18n.t();
    @let m = member();
    <article class="card-box m-4 flex max-w-[400px] items-start gap-3">
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-[1.3rem] font-semibold text-white"
      >
        {{ m.name.charAt(0).toUpperCase() }}
      </div>
      <div class="min-w-0">
        <h3 class="mb-1 text-brand">
          <a [routerLink]="['/members', m.id]" class="hover:underline">{{ m.name }}</a>
        </h3>
        <p class="my-0.5 overflow-hidden text-[0.9rem] text-ellipsis text-[#444]">
          {{ t.members.email }}: <bdi>{{ m.email }}</bdi>
        </p>
        <p class="my-0.5 overflow-hidden text-[0.9rem] text-ellipsis text-[#444]">
          {{ t.members.joined }}: <bdi>{{ m.joinedAt.slice(0, 10) }}</bdi>
        </p>
        <span class="badge mt-2 py-[3px] text-[0.8rem]" [class]="m.active ? 'bg-ok' : 'bg-gray-500'">
          {{ m.active ? t.members.active : t.members.inactive }}
        </span>
      </div>
    </article>
  `,
})
export class MemberCard {
  protected readonly i18n = inject(I18nService);
  readonly member = input.required<Member>();
}
