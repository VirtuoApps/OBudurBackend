import { IsDate, IsEmail, IsOptional } from 'class-validator';

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
  password: string;

  @IsString()
  @IsOptional()
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @IsString()
  profilePicture: string;

  @IsOptional()
  @IsString()
  birthDate: string;
}
