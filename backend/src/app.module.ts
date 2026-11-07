import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { BooksModule } from './books/books.module.js';
import { MembersModule } from './members/members.module.js';
import { LoansModule } from './loans/loans.module.js';
import { AuthModule } from './auth/auth.module.js';
@Module({
  imports: [PrismaModule, BooksModule, MembersModule, LoansModule ,AuthModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}