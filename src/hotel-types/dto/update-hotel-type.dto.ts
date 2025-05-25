import { IsOptional, IsObject } from 'class-validator';

export class UpdateHotelTypeDto {
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;
}
