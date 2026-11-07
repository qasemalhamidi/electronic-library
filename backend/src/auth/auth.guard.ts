import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from './jwt.js';
import { IS_PUBLIC_KEY, ROLES_KEY, type Role } from './roles.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, targets);

    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (token) {
      try {
        request.user = await verifyToken(token);
      } catch {
        if (!isPublic) throw new UnauthorizedException('UNAUTHORIZED');
      }
    }

    if (isPublic) return true;
    if (!request.user) throw new UnauthorizedException('UNAUTHORIZED');
    if (roles && !roles.includes(request.user.role)) {
      throw new ForbiddenException('FORBIDDEN');
    }
    return true;
  }
}