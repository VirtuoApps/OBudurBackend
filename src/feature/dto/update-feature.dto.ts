import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
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
  @IsIn([
    'inside',
    'outside',
    'general',
    'for-olds-and-disabled',
    'face',
    'infrastructure',
    'scenery',
  ])
  @IsOptional()
  featureType?: string;

  @IsString()
  @IsIn(['house', 'office', 'land', 'other', 'all'])
  @IsOptional()
  housingType?: string;

  @IsBoolean()
  @IsOptional()
  isQuickFilter?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
