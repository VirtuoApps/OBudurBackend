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
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Sub-DTOs defined in create-hotel.dto.ts ---
// Re-define or import if needed, but for Update (Partial), we can define inline optional versions

class PriceUpdateDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string; // Defaults to USD in schema
}

class DistanceUpdateDto {
  @IsMongoId()
  @IsOptional()
  typeId?: string;

  @IsNumber()
  @IsOptional()
  value?: number;
}

class GeoPointUpdateDto {
  @IsString()
  @IsIn(['Point'])
  @IsOptional()
  type?: 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  coordinates?: [number, number];
}

class ImageUpdateDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;
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

  @IsObject()
  @IsOptional()
  city?: Record<string, string>;

  @IsObject()
  @IsOptional()
  state?: Record<string, string>;

  @IsObject()
  @IsOptional()
  country?: Record<string, string>;

  @IsObject()
  @IsOptional()
  neighborhood?: Record<string, string>;

  @IsNumber()
  @IsOptional()
  floorCount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceUpdateDto)
  price?: PriceUpdateDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageUpdateDto)
  images?: ImageUpdateDto[];

  /* Details */
  @IsString()
  @IsOptional()
  roomAsText?: string;

  @IsNumber()
  @IsOptional()
  projectArea?: number;

  @IsNumber()
  @IsOptional()
  totalSize?: number;

  @IsNumber()
  @IsOptional()
  buildYear?: number;

  @IsString()
  @IsOptional()
  architect?: string;

  @IsObject()
  @IsOptional()
  kitchenType?: Record<string, string>;

  @IsNumber()
  @IsOptional()
  roomCount?: number;

  @IsNumber()
  @IsOptional()
  bathroomCount?: number;

  @IsNumber()
  @IsOptional()
  balconyCount?: number;

  @IsNumber()
  @IsOptional()
  bedRoomCount?: number;

  @IsObject()
  @IsOptional()
  floorType?: Record<string, string>;

  @IsObject()
  @IsOptional()
  housingType?: Record<string, string>;

  @IsObject()
  @IsOptional()
  entranceType?: Record<string, string>;

  @IsObject()
  @IsOptional()
  listingType?: Record<string, string>;

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

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  face?: 'west' | 'east' | 'south' | 'north';

  @IsObject()
  @IsOptional()
  street?: Record<string, string>;

  @IsString()
  @IsOptional()
  buildingNo?: string;

  @IsString()
  @IsOptional()
  apartmentNo?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsString()
  @IsOptional()
  status?: string;

  // New fields
  @IsBoolean()
  @IsOptional()
  exchangeable?: boolean;

  @IsOptional()
  creditEligible?: boolean;

  @IsNumber()
  @IsOptional()
  buildingAge?: number;

  @IsBoolean()
  @IsOptional()
  isFurnished?: boolean;

  @IsOptional()
  dues?: Record<string, any>;

  @IsObject()
  @IsOptional()
  usageStatus?: Record<string, string>;

  @IsObject()
  @IsOptional()
  deedStatus?: Record<string, string>;

  @IsObject()
  @IsOptional()
  heatingType?: Record<string, string>;

  @IsObject()
  @IsOptional()
  source?: Record<string, string>;

  @IsObject()
  @IsOptional()
  generalFeatures?: Record<string, string>;

  @IsObject()
  @IsOptional()
  zoningStatus?: Record<string, string>;

  @IsOptional()
  @IsArray()
  infrastructureFeatureIds: string[];

  @IsOptional()
  @IsArray()
  viewIds: string[];

  @IsObject()
  @IsOptional()
  floorPosition?: Record<string, string>;
}
