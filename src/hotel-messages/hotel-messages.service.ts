import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelMessages } from 'src/common/schemas/HotelMessages.schema';
import { CreateInitialMessageDto } from './dto/create-initial-message.dto';
import { SetMessageSeenDto } from './dto/set-message-seen.dto';
@Injectable()
export class HotelMessagesService {
  constructor(
    @InjectModel(HotelMessages.name)
    private readonly hotelMessagesModel: Model<HotelMessages>,
  ) {}

  async getMessagesOfHotel(hotelId: string) {
    const messages = await this.hotelMessagesModel
      .find({ hotelId })
      .sort({ createdAt: -1 });
    return messages;
  }

  async setMessageSeen(
    messageId: string,
    setMessageSeenDto: SetMessageSeenDto,
  ) {
    const message = await this.hotelMessagesModel.findByIdAndUpdate(
      messageId,
      {
        isSeen: setMessageSeenDto.isSeen,
      },
      {
        new: true,
      },
    );
    return message;
  }

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
