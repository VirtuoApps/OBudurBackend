import { IsString, IsNotEmpty, IsOptional, IsUrl, IsIn } from 'class-validator';

export class CreateDistanceTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsIn(['m', 'km'])
  @IsOptional() // Uses default 'm' in schema
  unit?: string;
}
