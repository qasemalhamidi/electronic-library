import {ConflictException,Injectable,NotFoundException,} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.db.orm.public.Book.all();
  }

  async findOne(id: number) {
    const book = await this.prisma.db.orm.public.Book.where({ id }).first();
    if (!book) throw new NotFoundException('BOOK_NOT_FOUND');
    return book;
  }

  async create(dto: CreateBookDto) {
    return await this.prisma.db.orm.public.Book.create({
      title: dto.title,
      author: dto.author,
      category: dto.category,
      year: dto.year,
    });
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);

    const data: Partial<UpdateBookDto> = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    return await this.prisma.db.orm.public.Book.where({ id }).update(data);
  }

  async remove(id: number) {
    await this.findOne(id);

    const hasLoans = await this.prisma.db.orm.public.Loan.where({
      bookId: id,
    }).first();
    if (hasLoans) throw new ConflictException('BOOK_HAS_LOANS');

    return await this.prisma.db.orm.public.Book.where({ id }).delete();
  }
}