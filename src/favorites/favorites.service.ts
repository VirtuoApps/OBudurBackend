import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Favorite } from 'src/common/schemas/Favorite.schema';
import { Model, Types } from 'mongoose';
import { FavoriteDocument } from 'src/common/schemas/Favorite.schema';
import { Hotel, HotelDocument } from 'src/common/schemas/Hotel.schema';
import { Feature, FeatureDocument } from 'src/common/schemas/Feature.schema';
import {
  DistanceType,
  DistanceTypeDocument,
} from 'src/common/schemas/DistanceType.schema';
import { User, UserDocument } from 'src/common/schemas/Users.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,
    @InjectModel(Feature.name)
    private featureModel: Model<FeatureDocument>,
    @InjectModel(DistanceType.name)
    private distanceTypeModel: Model<DistanceTypeDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async addFavorite(
    userId: string,
    hotelId: string,
  ): Promise<FavoriteDocument> {
    // Check if the hotel exists
    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // Check if already favorited
    const existingFavorite = await this.favoriteModel.findOne({
      userId,
      hotelId,
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    // Create new favorite
    const favorite = new this.favoriteModel({
      userId,
      hotelId,
    });

    // Increment favorite count
    await this.hotelModel.findByIdAndUpdate(hotelId, {
      $inc: { favoriteCount: 1 },
    });

    return favorite.save();
  }

  async removeFavorite(userId: string, hotelId: string): Promise<void> {
    // Check if the hotel exists
    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // Remove favorite
    const result = await this.favoriteModel.deleteOne({
      userId,
      hotelId,
    });

    if (result.deletedCount > 0) {
      // Decrement favorite count
      await this.hotelModel.findByIdAndUpdate(hotelId, {
        $inc: { favoriteCount: -1 },
      });
    }
  }

  async getUserFavorites(userId: string): Promise<any[]> {
    const favorites = await this.favoriteModel.find({ userId }).lean().exec();

    if (favorites.length === 0) {
      return [];
    }

    const hotelIds = favorites.map((favorite) => favorite.hotelId);
    const hotels = await this.hotelModel
      .find({ _id: { $in: hotelIds } })
      .lean();

    // Create a map for quick lookup
    const hotelMap = new Map();
    hotels.forEach((hotel) => {
      hotelMap.set(hotel._id.toString(), hotel);
    });

    // Combine favorite and hotel data
    const populatedFavorites = await Promise.all(
      favorites.map(async (favorite) => {
        const hotel = hotelMap.get(favorite.hotelId);

        if (!hotel) {
          return {
            ...favorite,
            hotel: null,
          };
        }

        // Find features if available
        let generalFeatures = [];
        let insideFeatures = [];
        let outsideFeatures = [];

        if (hotel.featureIds && hotel.featureIds.length > 0) {
          generalFeatures = await this.featureModel
            .find({
              featureType: 'general',
              _id: { $in: hotel.featureIds },
            })
            .lean();

          insideFeatures = await this.featureModel
            .find({
              featureType: 'inside',
              _id: { $in: hotel.featureIds },
            })
            .lean();

          outsideFeatures = await this.featureModel
            .find({
              featureType: 'outside',
              _id: { $in: hotel.featureIds },
            })
            .lean();
        }

        // Find distances if available
        let populatedDistances = [];
        if (hotel.distances && hotel.distances.length > 0) {
          const distanceTypeIds = hotel.distances.map((d) => d.typeId);
          const distanceTypes = await this.distanceTypeModel
            .find({
              _id: { $in: distanceTypeIds },
            })
            .lean();

          populatedDistances = hotel.distances.map((distance) => {
            const distanceType = distanceTypes.find(
              (dt) => dt._id.toString() === distance.typeId.toString(),
            );

            if (distanceType) {
              return {
                ...distanceType,
                value: distance.value,
              };
            }

            return distance;
          });
        }

        // Find manager if available
        let manager = null;
        if (hotel.managerId) {
          manager = await this.userModel.findById(hotel.managerId).lean();
        }

        return {
          _id: favorite._id,
          userId: favorite.userId,
          hotelId: favorite.hotelId,
          createdAt: favorite.createdAt,
          updatedAt: favorite.updatedAt,
          hotelDetails: hotel,
          populatedData: {
            generalFeatures,
            insideFeatures,
            outsideFeatures,
            distances: populatedDistances,
          },
          manager,
        };
      }),
    );

    return populatedFavorites;
  }
}
