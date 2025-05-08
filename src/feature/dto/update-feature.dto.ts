import { IsString, IsOptional, IsUrl, IsIn, IsObject } from 'class-validator';

// Manually define Update DTO
export class UpdateFeatureDto {
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsIn(['inside', 'outside', 'general'])
  @IsOptional()
  featureType?: string;
}
