import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsIn,
  IsObject,
} from 'class-validator';

export class CreateDistanceTypeDto {
  @IsObject()
  @IsNotEmpty()
  name: Record<string, string>;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsIn(['m', 'km'])
  @IsOptional() // Uses default 'm' in schema
  unit?: string;
}
