import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from 'src/common/schemas/Favorite.schema';
import { FavoritesService } from './favorites.service';
import { Hotel, HotelSchema } from 'src/common/schemas/Hotel.schema';
import { Feature, FeatureSchema } from 'src/common/schemas/Feature.schema';
import {
  DistanceType,
  DistanceTypeSchema,
} from 'src/common/schemas/DistanceType.schema';
import { User, UserSchema } from 'src/common/schemas/Users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Favorite.name,
        schema: FavoriteSchema,
      },
      {
        name: Hotel.name,
        schema: HotelSchema,
      },
      {
        name: Feature.name,
        schema: FeatureSchema,
      },
      {
        name: DistanceType.name,
        schema: DistanceTypeSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
