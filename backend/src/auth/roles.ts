import { SetMetadata } from '@nestjs/common';

export type Role = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);