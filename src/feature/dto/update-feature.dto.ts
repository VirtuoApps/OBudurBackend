import {
  IsString,
  IsOptional,
  IsUrl,
  IsIn,
  IsObject,
  IsBoolean,
} from 'class-validator';

// Manually define Update DTO
export class UpdateFeatureDto {
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsIn(['inside', 'outside', 'general', 'for-olds-and-disabled', 'face'])
  @IsOptional()
  featureType?: string;

  @IsBoolean()
  @IsOptional()
  isQuickFilter?: boolean;
}
