// Simple DTO for getting hotel categories

import { IsNotEmpty } from 'class-validator';

import { IsOptional } from 'class-validator';

import { IsString } from 'class-validator';

// No specific filters needed, just using general pagination
export class GetHotelCategoriesDto {
  // This can be extended in the future if specific filters are needed

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hotelTypeId: string;
}
