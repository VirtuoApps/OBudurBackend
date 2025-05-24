import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HotelCategory,
  HotelCategorySchema,
} from '../common/schemas/HotelCategory.schema';
import { HotelCategoryController } from './hotel-category.controller';
import { HotelCategoryService } from './hotel-category.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: HotelCategory.name, schema: HotelCategorySchema },
    ]),
  ],
  controllers: [HotelCategoryController],
  providers: [HotelCategoryService],
  exports: [HotelCategoryService],
})
export class HotelCategoryModule {}
