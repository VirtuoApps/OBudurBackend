import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MailDropperDocument = MailDropper & Document;

@Schema({ timestamps: true })
export class MailDropper {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: true })
  active: boolean;
}

export const MailDropperSchema = SchemaFactory.createForClass(MailDropper);
