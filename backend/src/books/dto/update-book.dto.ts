import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateBookDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'TITLE_REQUIRED' })
  @IsNotEmpty({ message: 'TITLE_REQUIRED' })
  title?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'AUTHOR_REQUIRED' })
  @IsNotEmpty({ message: 'AUTHOR_REQUIRED' })
  author?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'CATEGORY_REQUIRED' })
  @IsNotEmpty({ message: 'CATEGORY_REQUIRED' })
  category?: string;

  @IsOptional()
  @IsInt({ message: 'YEAR_INVALID' })
  @Min(1000, { message: 'YEAR_INVALID' })
  @Max(2100, { message: 'YEAR_INVALID' })
  year?: number;
}