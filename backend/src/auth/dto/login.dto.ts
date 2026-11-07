import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail({}, { message: 'EMAIL_INVALID' })
  email!: string;

  @IsString({ message: 'PASSWORD_REQUIRED' })
  @IsNotEmpty({ message: 'PASSWORD_REQUIRED' })
  password!: string;
}