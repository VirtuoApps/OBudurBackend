import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
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
import { TranslationService } from 'src/common/services/translation.service';

@Module({
  imports: [
    ConfigModule,
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
  providers: [HotelService, TranslationService],
})
export class HotelModule {}
