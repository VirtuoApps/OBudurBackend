import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from '../common/schemas/Hotel.schema';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { AuthModule } from 'src/auth/auth.module';
import { HotelUserController } from './hotel.user.controller';
import { Feature, FeatureSchema } from 'src/common/schemas/Feature.schema';
import {
  DistanceType,
  DistanceTypeSchema,
} from 'src/common/schemas/DistanceType.schema';
import { User, UserSchema } from 'src/common/schemas/Users.schema';
import {
  HotelMessages,
  HotelMessagesSchema,
} from 'src/common/schemas/HotelMessages.schema';
import { CurrencyModule } from 'src/common/services/currency.module';
// Import related modules if needed for validation (e.g., check if FeatureIds/DistanceTypeIds exist)
// import { FeatureModule } from '../feature/feature.module';
// import { DistanceTypeModule } from '../distancetype/distancetype.module';

@Module({
  imports: [
    AuthModule,
    CurrencyModule,
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: Feature.name, schema: FeatureSchema },
      {
        name: DistanceType.name,
        schema: DistanceTypeSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: HotelMessages.name, schema: HotelMessagesSchema },
    ]),
    // FeatureModule, // Uncomment if FeatureService needed for validation
    // DistanceTypeModule, // Uncomment if DistanceTypeService needed for validation
  ],
  controllers: [HotelController, HotelUserController],
  providers: [HotelService],
})
export class HotelModule {}
