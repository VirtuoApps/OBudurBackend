import { Favorite, FavoriteSchema } from '../common/schemas/Favorite.schema';
import { Hotel, HotelSchema } from '../common/schemas/Hotel.schema';
import {
  HotelMessages,
  HotelMessagesSchema,
} from '../common/schemas/HotelMessages.schema';
import {
  SavedFilter,
  SavedFilterSchema,
} from '../common/schemas/SavedFilter.schema';
import { User, UserSchema } from '../common/schemas/Users.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Hotel.name, schema: HotelSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: SavedFilter.name, schema: SavedFilterSchema },
      { name: HotelMessages.name, schema: HotelMessagesSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService if it needs to be used in other modules
})
export class UsersModule {}
