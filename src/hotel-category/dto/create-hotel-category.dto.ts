import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateHotelCategoryDto {
  @IsObject()
  @IsNotEmpty()
  name: Record<string, string>; // Use Record<string, string> which maps well to Map

  @IsString()
  @IsNotEmpty()
  hotelTypeId: string;
}
