import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLoanDto } from './dto/create-loan.dto.js';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.orm.public.Loan.all();
  }

  async create(dto: CreateLoanDto) {
    return await this.prisma.db.transaction(async (tx) => {
      const book = await tx.orm.public.Book.where({ id: dto.bookId }).first();
      if (!book) throw new NotFoundException('BOOK_NOT_FOUND');
      if (!book.available) {
        throw new BadRequestException('BOOK_ALREADY_BORROWED');
      }

      const member = await tx.orm.public.User.where({
        id: dto.memberId,
        role: 'MEMBER',
      }).first();
      if (!member) throw new NotFoundException('MEMBER_NOT_FOUND');
      if (!member.active) throw new BadRequestException('MEMBER_NOT_ACTIVE');

      const loan = await tx.orm.public.Loan.create({
        bookId: dto.bookId,
        memberId: dto.memberId,
      });
      await tx.orm.public.Book.where({ id: dto.bookId }).update({
        available: false,
      });
      return loan;
    });
  }

  async returnLoan(id: number) {
    return await this.prisma.db.transaction(async (tx) => {
      const loan = await tx.orm.public.Loan.where({ id }).first();
      if (!loan) throw new NotFoundException('LOAN_NOT_FOUND');
      if (loan.returnedAt) {
        throw new BadRequestException('LOAN_ALREADY_RETURNED');
      }

      const updated = await tx.orm.public.Loan.where({ id }).update({
        returnedAt: new Date().toISOString(),
      });
      await tx.orm.public.Book.where({ id: loan.bookId }).update({
        available: true,
      });
      return updated;
    });
  }
}