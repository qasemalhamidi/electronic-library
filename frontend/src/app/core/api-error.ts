import { HttpErrorResponse } from '@angular/common/http';

/** خطأ يحمل "كود" الخطأ القادم من الـ Backend (مثل EMAIL_EXISTS) ليُترجم لاحقاً. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status = 0,
  ) {
    super(code);
  }
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;

  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return new ApiError('SERVER_UNREACHABLE', 0);

    const message = e.error?.message;
    if (Array.isArray(message)) {
      return new ApiError([...new Set(message as string[])].join(','), e.status);
    }
    if (typeof message === 'string') return new ApiError(message, e.status);
  }
  return new ApiError('UNKNOWN', (e as { status?: number })?.status ?? 0);
}

export function isAuthError(e: unknown): boolean {
  const status = toApiError(e).status;
  return status === 401 || status === 403;
}

export function translateError(error: string, errors: Record<string, string>): string {
  return error
    .split(',')
    .map((code) => errors[code.trim()] ?? code.trim())
    .join(' · ');
}
