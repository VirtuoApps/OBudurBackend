import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HotelMessagesDocument = HydratedDocument<HotelMessages>;

@Schema({ timestamps: true, collection: 'hotel_messages' })
export class HotelMessages {
  @Prop({ type: String, required: true })
  senderUserId: string;

  @Prop({ type: String, required: true })
  hotelId: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  isInitialMessage: boolean;

  @Prop({ type: Boolean, default: false })
  iWantToSeeProperty: boolean;

  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: Boolean, required: true, default: false })
  isSeen: boolean;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  updatedAt: Date;
}

export const HotelMessagesSchema = SchemaFactory.createForClass(HotelMessages);
