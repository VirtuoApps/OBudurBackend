import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetHotelsDto {
  @IsOptional()
  @IsString()
  listingType: string;

  @IsOptional()
  @IsString()
  housingType: string;

  @IsOptional()
  @IsString()
  entranceType: string;

  // New fields for filtering
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  exchangeable?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  creditEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFurnished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  buildingAge?: number;

  @IsOptional()
  @IsString()
  usageStatus?: string;

  @IsOptional()
  @IsString()
  deedStatus?: string;

  @IsOptional()
  @IsString()
  heatingType?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
