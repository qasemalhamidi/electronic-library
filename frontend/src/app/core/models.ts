export type Role = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  year: number;
  available: boolean;
}

export interface BookInput {
  title: string;
  author: string;
  category: string;
  year: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  active: boolean;
}

export interface MemberInput {
  name: string;
  email: string;
  active?: boolean;
}

export interface Loan {
  id: number;
  bookId: number;
  memberId: number;
  borrowedAt: string;
  returnedAt: string | null;
}
