import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { signToken } from './jwt.js';
import { verifyPassword } from './password.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.db.orm.public.User.where({
      email,
    }).first();
    const valid = user ? await verifyPassword(dto.password, user.password) : false;
    if (!user || !valid) throw new UnauthorizedException('INVALID_CREDENTIALS');

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}