// import { PartialType } from '@nestjs/mapped-types'; // Use mapped-types for easy partial DTO
// import { CreateLanguageDto } from './create-language.dto';

// export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {}

import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

// Manually define Update DTO as mapped-types is not available/compatible
export class UpdateLanguageDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nativeName?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
