import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { toApiError } from './api-error';
import { User } from './models';

const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(this.readToken());
  readonly user = signal<User | null>(null);
  readonly isStaff = computed(() => {
    const role = this.user()?.role;
    return role === 'ADMIN' || role === 'LIBRARIAN';
  });

  /** يُستدعى عند إقلاع التطبيق: يجلب بيانات المستخدم إن كان هناك token محفوظ. */
  async init(): Promise<void> {
    if (!this.token()) return;
    try {
      this.user.set(await firstValueFrom(this.http.get<User>(`${environment.apiUrl}/auth/me`)));
    } catch (e) {
      if (toApiError(e).status === 401) this.clear();
      this.user.set(null);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const { token } = await firstValueFrom(
        this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password }),
      );
      this.writeToken(token);
      this.token.set(token);
      await this.init();
    } catch (e) {
      throw toApiError(e);
    }
  }

  logout(): void {
    this.clear();
  }

  /** مسح الجلسة (خروج أو token منتهي). */
  clear(): void {
    this.writeToken(null);
    this.token.set(null);
    this.user.set(null);
  }

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private writeToken(value: string | null): void {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* التخزين غير متاح */
    }
  }
}
