import {
  IsString,
  IsOptional,
  IsEmail,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  password?: string; // Password is optional for update

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin', 'super-admin'])
  role?: 'user' | 'admin' | 'super-admin';

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
