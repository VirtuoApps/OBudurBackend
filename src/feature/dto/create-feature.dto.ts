import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsIn,
  IsObject,
  // ValidateNested, // Not needed for basic object check
  // IsMap, // Does not exist
} from 'class-validator';
// import { Type } from 'class-transformer'; // Not needed without ValidateNested

// Helper DTO for Map<string, string>
// Direct validation of Maps is complex with class-validator.
// We accept a plain object using Record<string, string>.
// class StringMapDto { // Not needed for basic validation
//     [key: string]: string;
// }

export class CreateFeatureDto {
  @IsObject() // Using IsObject to validate the Map structure
  @IsNotEmpty()
  name: Record<string, string>; // Use Record<string, string> which maps well to Map

  @IsUrl()
  @IsNotEmpty()
  iconUrl: string;

  @IsString()
  @IsIn(['inside', 'outside', 'general'])
  @IsNotEmpty()
  featureType: string;
}
