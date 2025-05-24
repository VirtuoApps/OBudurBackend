import { IsOptional, IsObject } from 'class-validator';

export class UpdateHotelCategoryDto {
  @IsObject()
  @IsOptional()
  name?: Record<string, string>;
}
