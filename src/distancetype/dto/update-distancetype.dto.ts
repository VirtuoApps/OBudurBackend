import { IsObject, IsOptional, IsString, IsUrl, IsIn } from 'class-validator';

// Manually define Update DTO
export class UpdateDistanceTypeDto {
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsIn(['m', 'km'])
  @IsOptional()
  unit?: string;
}
