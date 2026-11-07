import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

/** يطابق requireStaff(): غير الموظف يُحوَّل إلى /login */
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isStaff() ? true : inject(Router).createUrlTree(['/login']);
};

/** صفحة الدخول: المستخدم المسجّل يُحوَّل إلى الرئيسية */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.user() ? inject(Router).createUrlTree(['/']) : true;
};
