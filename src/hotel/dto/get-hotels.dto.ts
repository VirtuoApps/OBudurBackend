import { IsOptional, IsString } from 'class-validator';

export class GetHotelsDto {
  @IsOptional()
  @IsString()
  listingType: string;
}
