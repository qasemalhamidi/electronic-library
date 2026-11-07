import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { toApiError } from './api-error';
import { AuthService } from './auth';
import { Book, BookInput, Loan, Member, MemberInput } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // ---------- قراءة (401/403 => صفحة الدخول، كما في apiFetch الأصلية) ----------
  getBooks(): Promise<Book[]> {
    return this.read<Book[]>('/books');
  }

  async getBook(id: number): Promise<Book | null> {
    return this.readOrNull<Book>(`/books/${id}`);
  }

  getMembers(): Promise<Member[]> {
    return this.read<Member[]>('/members');
  }

  async getMember(id: number): Promise<Member | null> {
    return this.readOrNull<Member>(`/members/${id}`);
  }

  getLoans(): Promise<Loan[]> {
    return this.read<Loan[]>('/loans');
  }

  // ---------- كتابة (الأخطاء تُعاد للنموذج ليعرضها) ----------
  createBook(data: BookInput): Promise<unknown> {
    return this.write(() => this.http.post(this.url('/books'), data));
  }

  updateBook(id: number, data: BookInput): Promise<unknown> {
    return this.write(() => this.http.patch(this.url(`/books/${id}`), data));
  }

  deleteBook(id: number): Promise<unknown> {
    return this.write(() => this.http.delete(this.url(`/books/${id}`)));
  }

  createMember(data: MemberInput): Promise<unknown> {
    return this.write(() => this.http.post(this.url('/members'), data));
  }

  updateMember(id: number, data: MemberInput): Promise<unknown> {
    return this.write(() => this.http.patch(this.url(`/members/${id}`), data));
  }

  deleteMember(id: number): Promise<unknown> {
    return this.write(() => this.http.delete(this.url(`/members/${id}`)));
  }

  borrowBook(bookId: number, memberId: number): Promise<unknown> {
    return this.write(() => this.http.post(this.url('/loans'), { bookId, memberId }));
  }

  returnLoan(loanId: number): Promise<unknown> {
    return this.write(() => this.http.patch(this.url(`/loans/${loanId}/return`), {}));
  }

  // ---------- داخلي ----------
  private url(path: string): string {
    return `${environment.apiUrl}${path}`;
  }

  private async read<T>(path: string): Promise<T> {
    try {
      return await firstValueFrom(this.http.get<T>(this.url(path)));
    } catch (e) {
      const err = toApiError(e);
      if (err.status === 401 || err.status === 403) {
        if (err.status === 401) this.auth.clear();
        void this.router.navigateByUrl('/login');
      }
      throw err;
    }
  }

  private async readOrNull<T>(path: string): Promise<T | null> {
    try {
      return await this.read<T>(path);
    } catch (e) {
      if (toApiError(e).status === 404) return null;
      throw e;
    }
  }

  private async write(request: () => Observable<unknown>): Promise<unknown> {
    try {
      return await firstValueFrom(request());
    } catch (e) {
      throw toApiError(e);
    }
  }
}
