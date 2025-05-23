import { IsEmail, IsOptional } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

export class UpdateMineAccountDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
