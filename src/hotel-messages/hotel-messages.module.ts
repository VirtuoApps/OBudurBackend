import { Module } from '@nestjs/common';
import { HotelMessagesController } from './hotel-messages.controller';
import {
  HotelMessages,
  HotelMessagesSchema,
} from 'src/common/schemas/HotelMessages.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelMessagesService } from './hotel-messages.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: HotelMessages.name, schema: HotelMessagesSchema },
    ]),
  ],
  controllers: [HotelMessagesController],
  providers: [HotelMessagesService],
})
export class HotelMessagesModule {}
