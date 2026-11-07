import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ar } from './dictionaries/ar';
import { en } from './dictionaries/en';

export type Locale = 'en' | 'ar';
export type Dictionary = typeof en;

const STORAGE_KEY = 'lang';
const dictionaries: Record<Locale, Dictionary> = { en, ar };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);

  readonly locale = signal<Locale>(this.read());
  readonly dir = computed<'rtl' | 'ltr'>(() => (this.locale() === 'ar' ? 'rtl' : 'ltr'));
  readonly t = computed<Dictionary>(() => dictionaries[this.locale()]);

  constructor() {
    effect(() => {
      const root = this.doc.documentElement;
      root.lang = this.locale();
      root.dir = this.dir();
      try {
        localStorage.setItem(STORAGE_KEY, this.locale());
      } catch {
        /* التخزين غير متاح */
      }
    });
  }

  toggle(): void {
    this.locale.update((l) => (l === 'ar' ? 'en' : 'ar'));
  }

  private read(): Locale {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }
}
