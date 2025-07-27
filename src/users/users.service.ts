import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../common/schemas/Users.schema';
import { Hotel, HotelDocument } from '../common/schemas/Hotel.schema';
import { Favorite, FavoriteDocument } from '../common/schemas/Favorite.schema';
import {
  SavedFilter,
  SavedFilterDocument,
} from '../common/schemas/SavedFilter.schema';
import {
  HotelMessages,
  HotelMessagesDocument,
} from '../common/schemas/HotelMessages.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import generalPaginate, { queryType } from '../common/utils/general-paginate';
import * as bcrypt from 'bcrypt';
import errorCodes from '../common/errorCodes/errorCodes';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Hotel.name) private readonly hotelModel: Model<HotelDocument>,
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
    @InjectModel(SavedFilter.name)
    private readonly savedFilterModel: Model<SavedFilterDocument>,
    @InjectModel(HotelMessages.name)
    private readonly hotelMessagesModel: Model<HotelMessagesDocument>,
  ) {}

  async getMe(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: `User with ID ${userId} not found`,
        statusCode: 404,
      });
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException({
        errorCode: errorCodes.EMAIL_ALREADY_EXISTS,
        message: 'Email already exists',
        statusCode: 400,
      });
    }

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(query: queryType) {
    return generalPaginate({
      model: this.userModel,
      query,
      searchFields: ['email', 'firstName', 'lastName'], // Adjust as needed
      extraQueries: {}, // Add any default filters if necessary
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: `User with ID ${id} not found`,
        statusCode: 404,
      });
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email) {
      const userToUpdate = await this.userModel.findById(id).exec();
      if (!userToUpdate) {
        throw new NotFoundException({
          errorCode: errorCodes.USER_NOT_FOUND,
          message: `User with ID ${id} not found`,
          statusCode: 404,
        });
      }
      if (userToUpdate.email !== updateUserDto.email) {
        const existingUserWithNewEmail = await this.userModel
          .findOne({ email: updateUserDto.email })
          .exec();
        if (
          existingUserWithNewEmail &&
          existingUserWithNewEmail._id.toString() !== id
        ) {
          throw new BadRequestException({
            errorCode: errorCodes.EMAIL_ALREADY_EXISTS,
            message: 'New email already exists for another user',
            statusCode: 400,
          });
        }
      }
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: `User with ID ${id} not found`,
        statusCode: 404,
      });
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    // First, verify the user exists
    const userToDelete = await this.userModel.findById(id).exec();
    if (!userToDelete) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: `User with ID ${id} not found`,
        statusCode: 404,
      });
    }

    // Convert user ID to ObjectId for queries
    const userObjectId = new Types.ObjectId(id);

    try {
      // Start cascading delete operations
      // 1. Delete all hotels owned by the user
      const deletedHotelsResult = await this.hotelModel
        .deleteMany({ managerId: userObjectId })
        .exec();

      // 2. Delete all favorites by the user
      const deletedFavoritesResult = await this.favoriteModel
        .deleteMany({ userId: id })
        .exec();

      // 3. Delete all saved filters by the user
      const deletedSavedFiltersResult = await this.savedFilterModel
        .deleteMany({ userId: id })
        .exec();

      // 4. Delete all hotel messages sent by the user
      const deletedMessagesResult = await this.hotelMessagesModel
        .deleteMany({ senderUserId: id })
        .exec();

      // Finally, delete the user
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

      console.log(`Cascading delete completed for user ${id}:`);
      console.log(`- Deleted ${deletedHotelsResult.deletedCount} hotels`);
      console.log(`- Deleted ${deletedFavoritesResult.deletedCount} favorites`);
      console.log(
        `- Deleted ${deletedSavedFiltersResult.deletedCount} saved filters`,
      );
      console.log(
        `- Deleted ${deletedMessagesResult.deletedCount} hotel messages`,
      );

      return deletedUser;
    } catch (error) {
      console.error('Error during cascading delete:', error);
      throw new BadRequestException({
        errorCode: 'CASCADE_DELETE_FAILED',
        message: 'Failed to delete user and related data',
        statusCode: 400,
      });
    }
  }

  /**
   * Alternative implementation using MongoDB transactions for better data consistency
   * Use this version if you want atomic operations (all-or-nothing)
   */
  async removeWithTransaction(id: string): Promise<User> {
    // First, verify the user exists
    const userToDelete = await this.userModel.findById(id).exec();
    if (!userToDelete) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: `User with ID ${id} not found`,
        statusCode: 404,
      });
    }

    const session = await this.userModel.db.startSession();

    try {
      const result = await session.withTransaction(async () => {
        // Convert user ID to ObjectId for queries
        const userObjectId = new Types.ObjectId(id);

        // 1. Delete all hotels owned by the user
        const deletedHotelsResult = await this.hotelModel
          .deleteMany({ managerId: userObjectId })
          .session(session);

        // 2. Delete all favorites by the user
        const deletedFavoritesResult = await this.favoriteModel
          .deleteMany({ userId: id })
          .session(session);

        // 3. Delete all saved filters by the user
        const deletedSavedFiltersResult = await this.savedFilterModel
          .deleteMany({ userId: id })
          .session(session);

        // 4. Delete all hotel messages sent by the user
        const deletedMessagesResult = await this.hotelMessagesModel
          .deleteMany({ senderUserId: id })
          .session(session);

        // Finally, delete the user
        const deletedUser = await this.userModel
          .findByIdAndDelete(id)
          .session(session);

        console.log(`Cascading delete completed for user ${id}:`);
        console.log(`- Deleted ${deletedHotelsResult.deletedCount} hotels`);
        console.log(
          `- Deleted ${deletedFavoritesResult.deletedCount} favorites`,
        );
        console.log(
          `- Deleted ${deletedSavedFiltersResult.deletedCount} saved filters`,
        );
        console.log(
          `- Deleted ${deletedMessagesResult.deletedCount} hotel messages`,
        );

        return deletedUser;
      });

      return result;
    } catch (error) {
      console.error('Error during transaction-based cascading delete:', error);
      throw new BadRequestException({
        errorCode: 'CASCADE_DELETE_FAILED',
        message: 'Failed to delete user and related data',
        statusCode: 400,
      });
    } finally {
      await session.endSession();
    }
  }
}
