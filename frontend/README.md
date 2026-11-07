# Electronic Library — Angular

نسخة Angular (v21، Standalone Components + Signals) من واجهة المكتبة الإلكترونية التي كانت مبنية بـ Next.js/React.
تحافظ على Tailwind CSS v4 وخط Cairo وثنائية اللغة (عربي RTL / English LTR).

## التشغيل

```bash
npm install
npm start            # http://localhost:4200
```

الـ Backend يجب أن يعمل على `http://localhost:3001`.
في التطوير تمر الطلبات عبر `proxy.conf.json` (`/api` → `localhost:3001`) فلا حاجة لتفعيل CORS.

## الإنتاج

```bash
npm run build
```

عدّل `src/environments/environment.production.ts` ليشير إلى رابط الـ Backend الفعلي،
وفعّل CORS في الـ Backend لدومين الواجهة (أو ضع الواجهة والـ API خلف نفس الدومين عبر reverse proxy وغيّر `apiUrl` إلى `/api`).
> أمر البناء يضمّن خط Cairo من Google Fonts أثناء البناء، لذا يحتاج اتصالاً بالإنترنت.

## المصادقة

الـ JWT يُحفظ في `localStorage` ويُرسل عبر `authInterceptor` كـ `Authorization: Bearer`.
(في نسخة Next كان في cookie من نوع httpOnly يضعها خادم Next؛ تطبيق SPA لا يستطيع ذلك.)

## هيكل المشروع

```
src/app/
  core/       models, api (ApiService), auth, interceptor, guards, i18n + dictionaries/{en,ar}.ts
  layout/     navbar, footer
  shared/     book-card, member-card, modal, book/member form dialogs,
              borrow-dialog, return-button, delete-button, status (loading/error/not-found)
  pages/      home, login, books, book-details, members, member-details
```

| Next.js | Angular |
|---|---|
| `app/**/page.tsx` | `pages/*.ts` + `app.routes.ts` |
| Server Actions | `ApiService` (HttpClient) |
| `requireStaff()` / redirect | `staffGuard` / `guestGuard` |
| `useActionState` | Reactive Forms + signals |
| cookie `lang` + `getDict()` | `I18nService` (signal) + `localStorage` |
| `*.module.css` | كلاسات Tailwind (+ `@layer components` في `styles.css`) |
| `revalidatePath` | إعادة تحميل البيانات بعد كل عملية |
