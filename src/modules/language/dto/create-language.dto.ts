import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10) // Assuming language codes are short
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nativeName?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
