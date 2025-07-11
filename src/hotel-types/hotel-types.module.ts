import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelType, HotelTypeSchema } from '../common/schemas/HotelType.schema';
import { HotelTypesController } from './hotel-types.controller';
import { HotelTypesService } from './hotel-types.service';
import { AuthModule } from 'src/auth/auth.module';
import {
  HotelCategory,
  HotelCategorySchema,
} from 'src/common/schemas/HotelCategory.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: HotelType.name, schema: HotelTypeSchema },
      { name: HotelCategory.name, schema: HotelCategorySchema },
    ]),
  ],
  controllers: [HotelTypesController],
  providers: [HotelTypesService],
  exports: [HotelTypesService],
})
export class HotelTypesModule {}
