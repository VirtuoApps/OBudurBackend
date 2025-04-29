import { IsString, IsOptional, IsUrl, IsIn } from 'class-validator';

// Manually define Update DTO
export class UpdateDistanceTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsIn(['m', 'km'])
  @IsOptional()
  unit?: string;
}
