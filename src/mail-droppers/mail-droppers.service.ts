import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MailDropper,
  MailDropperDocument,
} from './schemas/mail-dropper.schema';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class MailDroppersService {
  constructor(
    @InjectModel(MailDropper.name)
    private mailDropperModel: Model<MailDropperDocument>,
  ) {}

  async subscribe(
    subscribeDto: SubscribeDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { email } = subscribeDto;

      // Check if email already exists
      const existingSubscriber = await this.mailDropperModel.findOne({ email });

      if (existingSubscriber) {
        // If exists but inactive, reactivate
        if (!existingSubscriber.active) {
          existingSubscriber.active = true;
          await existingSubscriber.save();
          return {
            success: true,
            message: 'Your subscription has been reactivated.',
          };
        }
        return { success: false, message: 'This email is already subscribed.' };
      }

      // Create new subscriber
      await this.mailDropperModel.create({ email });
      return {
        success: true,
        message: 'Successfully subscribed to email updates.',
      };
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        throw new ConflictException('This email is already subscribed.');
      }
      throw new InternalServerErrorException('Unable to process subscription.');
    }
  }

  async unsubscribe(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const subscriber = await this.mailDropperModel.findOne({ email });

    if (!subscriber) {
      return {
        success: false,
        message: 'Email not found in our subscription list.',
      };
    }

    subscriber.active = false;
    await subscriber.save();
    return {
      success: true,
      message: 'Successfully unsubscribed from email updates.',
    };
  }
}
