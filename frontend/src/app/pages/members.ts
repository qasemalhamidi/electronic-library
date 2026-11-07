import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/api';
import { isAuthError } from '../core/api-error';
import { I18nService } from '../core/i18n';
import { Member } from '../core/models';
import { MemberCard } from '../shared/member-card';
import { MemberFormDialog } from '../shared/member-form-dialog';
import { ErrorState, Loading } from '../shared/status';

@Component({
  selector: 'app-members',
  imports: [MemberCard, MemberFormDialog, Loading, ErrorState],
  template: `
    @let t = i18n.t();
    @switch (state()) {
      @case ('loading') { <app-loading /> }
      @case ('error') { <app-error-state (retry)="load()" /> }
      @case ('ready') {
        <main>
          <section class="hero">
            <h1>{{ t.members.title }}</h1>
            <p>{{ t.members.welcome }}</p>
          </section>

          <app-member-form-dialog (saved)="load(true)" />

          <div class="grid-cards">
            @for (m of members(); track m.id) {
              <app-member-card [member]="m" />
            }
          </div>
        </main>
      }
    }
  `,
})
export class Members {
  protected readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly members = signal<Member[]>([]);

  constructor() {
    void this.load();
  }

  protected async load(silent = false): Promise<void> {
    if (!silent) this.state.set('loading');
    try {
      this.members.set(await this.api.getMembers());
      this.state.set('ready');
    } catch (e) {
      if (!isAuthError(e)) this.state.set('error');
    }
  }
}
