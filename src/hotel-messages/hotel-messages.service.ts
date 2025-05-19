import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelMessages } from 'src/common/schemas/HotelMessages.schema';
import { CreateInitialMessageDto } from './dto/create-initial-message.dto';

@Injectable()
export class HotelMessagesService {
  constructor(
    @InjectModel(HotelMessages.name)
    private readonly hotelMessagesModel: Model<HotelMessages>,
  ) {}

  async createInitialMessage(
    createInitialMessageDto: CreateInitialMessageDto,
    userId: string,
  ) {
    const newMessage = new this.hotelMessagesModel({
      ...createInitialMessageDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      senderUserId: userId,
      isInitialMessage: true,
      from: 'user',
    });

    return await newMessage.save();
  }

  async getExistsMessageOfHotel(hotelId: string, userId: string) {
    const message = await this.hotelMessagesModel.findOne({
      hotelId,
      senderUserId: userId,
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }
}
