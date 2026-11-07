import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword } from '../auth/password.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.orm.public.User.where({ role: 'MEMBER' }).all();
  }

  async findOne(id: number) {
    const member = await this.prisma.db.orm.public.User.where({
      id,
      role: 'MEMBER',
    }).first();
    if (!member) throw new NotFoundException('MEMBER_NOT_FOUND');
    return member;
  }

  async create(dto: CreateMemberDto) {
    const email = dto.email.toLowerCase();

    const emailExists = await this.prisma.db.orm.public.User.where({
      email,
    }).first();
    if (emailExists) throw new ConflictException('EMAIL_EXISTS');

    const usernameExists = await this.prisma.db.orm.public.User.where({
      username: dto.username,
    }).first();
    if (usernameExists) throw new ConflictException('USERNAME_EXISTS');

    const password = await hashPassword(dto.password);

    return await this.prisma.db.orm.public.User.create({
      name: dto.name,
      email,
      username: dto.username,
      password,
      role: 'MEMBER',
    });
  }

  async update(id: number, dto: UpdateMemberDto) {
    await this.findOne(id);

    const data: Partial<UpdateMemberDto> = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );

    if (data.email) {
      data.email = data.email.toLowerCase();
      const other = await this.prisma.db.orm.public.User.where({
        email: data.email,
      }).first();
      if (other && other.id !== id) {
        throw new ConflictException('EMAIL_EXISTS');
      }
    }

    if (data.username) {
      const other = await this.prisma.db.orm.public.User.where({
        username: data.username,
      }).first();
      if (other && other.id !== id) {
        throw new ConflictException('USERNAME_EXISTS');
      }
    }

    return await this.prisma.db.orm.public.User.where({ id }).update(data);
  }

  async remove(id: number) {
    await this.findOne(id);

    const hasLoans = await this.prisma.db.orm.public.Loan.where({
      memberId: id,
    }).first();
    if (hasLoans) throw new ConflictException('MEMBER_HAS_LOANS');

    return await this.prisma.db.orm.public.User.where({ id }).delete();
  }
}