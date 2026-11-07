import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LoansService } from './loans.service.js';
import { LoansController } from './loans.controller.js';

@Module({
  imports: [PrismaModule],
  providers: [LoansService],
  controllers: [LoansController],
})
export class LoansModule {}