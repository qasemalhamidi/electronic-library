import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateMemberDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'NAME_REQUIRED' })
  @IsNotEmpty({ message: 'NAME_REQUIRED' })
  name?: string;

  @IsOptional()
  @Transform(trim)
  @IsEmail({}, { message: 'EMAIL_INVALID' })
  email?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'USERNAME_REQUIRED' })
  @IsNotEmpty({ message: 'USERNAME_REQUIRED' })
  username?: string;

  @IsOptional()
  @IsBoolean({ message: 'ACTIVE_INVALID' })
  active?: boolean;
}