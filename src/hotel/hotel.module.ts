import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from '../common/schemas/Hotel.schema';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { AuthModule } from 'src/auth/auth.module';
import { HotelUserController } from './hotel.user.controller';
import { Feature, FeatureSchema } from 'src/common/schemas/Feature.schema';
// Import related modules if needed for validation (e.g., check if FeatureIds/DistanceTypeIds exist)
// import { FeatureModule } from '../feature/feature.module';
// import { DistanceTypeModule } from '../distancetype/distancetype.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: Feature.name, schema: FeatureSchema },
    ]),
    // FeatureModule, // Uncomment if FeatureService needed for validation
    // DistanceTypeModule, // Uncomment if DistanceTypeService needed for validation
  ],
  controllers: [HotelController, HotelUserController],
  providers: [HotelService],
})
export class HotelModule {}
