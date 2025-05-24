import { IsOptional, IsString } from 'class-validator';

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
}
