import { IsInt, Min } from 'class-validator';

export class CreateLoanDto {
  @IsInt({ message: 'BOOK_INVALID' })
  @Min(1, { message: 'BOOK_INVALID' })
  bookId!: number;

  @IsInt({ message: 'MEMBER_INVALID' })
  @Min(1, { message: 'MEMBER_INVALID' })
  memberId!: number;
}