import { Routes } from '@angular/router';
import { guestGuard, staffGuard } from './core/guards';
import { BookDetails } from './pages/book-details';
import { Books } from './pages/books';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { MemberDetails } from './pages/member-details';
import { Members } from './pages/members';
import { NotFound } from './shared/status';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'books', component: Books },
  { path: 'books/:id', component: BookDetails },
  { path: 'members', component: Members, canActivate: [staffGuard] },
  { path: 'members/:id', component: MemberDetails, canActivate: [staffGuard] },
  { path: '**', component: NotFound },
];
