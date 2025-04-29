import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsObject,
  IsIn,
  Min,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Sub-DTOs defined in create-hotel.dto.ts ---
// Re-define or import if needed, but for Update (Partial), we can define inline optional versions

class PriceUpdateDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;
}

class DistanceUpdateDto {
  @IsMongoId()
  @IsOptional() // Make typeId optional for update
  typeId?: string;

  @IsNumber()
  @IsOptional() // Make value optional for update
  @Min(0)
  value?: number;
}

class GeoPointUpdateDto {
  @IsString()
  @IsIn(['Point'])
  @IsOptional()
  type?: 'Point';

  @IsArray()
  @ArrayMinSize(2)
  // @ArrayMaxSize(2) // Removed
  @IsNumber({}, { each: true })
  @IsOptional()
  coordinates?: [number, number];
}

// --- Main Update DTO ---
// Using manual definition instead of PartialType
export class UpdateHotelDto {
  @IsNumber()
  @IsOptional()
  no?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsObject()
  @IsOptional()
  title?: Record<string, string>;

  @IsObject()
  @IsOptional()
  description?: Record<string, string>;

  @IsObject()
  @IsOptional()
  address?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceUpdateDto)
  price?: PriceUpdateDto;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  /* Details */
  @IsString()
  @IsOptional()
  roomAsText?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  projectArea?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalSize?: number;

  @IsNumber()
  @IsOptional()
  buildYear?: number;

  @IsString()
  @IsOptional()
  architect?: string;

  @IsString()
  @IsOptional()
  kitchenType?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  roomCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bathroomCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  balconyCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bedRoomCount?: number;

  @IsString()
  @IsOptional()
  floorType?: string;

  @IsString()
  @IsOptional()
  housingType?: string;

  @IsString()
  @IsOptional()
  entranceType?: string;

  @IsString()
  @IsOptional()
  listingType?: string;

  /* Relations */
  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  featureIds?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DistanceUpdateDto)
  distances?: DistanceUpdateDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointUpdateDto)
  location?: GeoPointUpdateDto;

  @IsString()
  @IsOptional()
  locationAsString?: string;

  @IsArray()
  @IsOptional()
  documents?: any[];
}
