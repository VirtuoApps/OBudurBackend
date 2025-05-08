import { IsOptional, IsString } from 'class-validator';

export class GetFeaturesDto {
  @IsString()
  @IsOptional()
  featureType: string;
}
