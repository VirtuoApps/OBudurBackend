import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../common/schemas/Users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import generalPaginate, { queryType } from '../common/utils/general-paginate';
import * as bcrypt from 'bcrypt';
import errorCodes from '../common/errorCodes/errorCodes';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: `User with ID ${id} not found`,
        statusCode: 404,
      });
    }
    return deletedUser;
  }
}
