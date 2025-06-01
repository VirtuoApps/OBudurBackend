import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class FeatureTypeDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  featureType?: string;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsNumber()
  @IsOptional()
  __v?: number;
}

class LocationTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  coordinates?: [number, number];
}

export class UpdateSavedFilterDto {
  @IsString()
  @IsOptional()
  filterName?: string;

  @IsBoolean()
  @IsOptional()
  enableNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  enableMailNotifications?: boolean;

  // Filter properties
  @IsString()
  @IsOptional()
  listingType?: string | null;

  @IsString()
  @IsOptional()
  state?: string | null;

  @IsString()
  @IsOptional()
  propertyType?: string | null;

  @IsString()
  @IsOptional()
  propertyTypeId?: string | null;

  @IsString()
  @IsOptional()
  roomAsText?: string | null;

  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  roomCount?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bathroomCount?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minProjectArea?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxProjectArea?: number | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  interiorFeatureIds?: string[] | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  exteriorFeatureIds?: string[] | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  accessibilityFeatureIds?: string[] | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  faceFeatureIds?: string[] | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  locationFeatureIds?: string[] | null;

  @IsBoolean()
  @IsOptional()
  isNewSelected?: boolean | null;

  @IsBoolean()
  @IsOptional()
  isOnePlusOneSelected?: boolean | null;

  @IsBoolean()
  @IsOptional()
  isTwoPlusOneSelected?: boolean | null;

  @IsBoolean()
  @IsOptional()
  isThreePlusOneSelected?: boolean | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FeatureTypeDto)
  selectedFeatures?: FeatureTypeDto[];

  @IsOptional()
  @IsObject()
  selectedLocation?: LocationTypeDto | null;
}
