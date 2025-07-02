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
  ArrayNotEmpty,
  ArrayMinSize,
  MaxLength,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Sub-DTOs ---
class PriceDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string; // Defaults to USD in schema
}

class DistanceDto {
  @IsMongoId()
  @IsOptional()
  typeId: string; // Validate as MongoId string

  @IsNumber()
  @IsOptional()
  value: number;
}

class GeoPointDto {
  @IsString()
  @IsIn(['Point'])
  @IsOptional()
  type: 'Point';

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

class ImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  order: number;
}

// --- Main DTOs ---
export class CreateHotelDto {
  @IsObject()
  @IsOptional()
  title: Record<string, string>;

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
  @Type(() => PriceDto)
  price?: PriceDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

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
  @Type(() => DistanceDto)
  distances?: DistanceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  location?: GeoPointDto;

  @IsArray()
  @IsOptional() // How to validate Mixed type? Allow any array for now.
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
  creditEligible?: any;

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
