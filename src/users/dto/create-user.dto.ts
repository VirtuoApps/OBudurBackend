import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  password?: string; // Password is required for creation

  @IsBoolean()
  @IsOptional()
  verified?: boolean; // Default is false in schema

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin'; // Default is 'user' in schema

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
