import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateMemberDto {
  @Transform(trim)
  @IsString({ message: 'NAME_REQUIRED' })
  @IsNotEmpty({ message: 'NAME_REQUIRED' })
  name!: string;

  @Transform(trim)
  @IsEmail({}, { message: 'EMAIL_INVALID' })
  email!: string;

  @Transform(trim)
  @IsString({ message: 'USERNAME_REQUIRED' })
  @IsNotEmpty({ message: 'USERNAME_REQUIRED' })
  username!: string;

  @IsString({ message: 'PASSWORD_REQUIRED' })
  @MinLength(6, { message: 'PASSWORD_TOO_SHORT' })
  password!: string;
}