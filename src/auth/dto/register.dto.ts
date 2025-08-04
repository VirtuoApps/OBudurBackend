import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsString()
  @MinLength(10)
  phoneNumber?: string;
}
