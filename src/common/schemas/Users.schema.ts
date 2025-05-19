import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;

  @Prop({ type: String, required: false })
  password: string;

  @Prop({ type: Boolean, required: true, default: false })
  verified: boolean;

  @Prop({ type: String, required: false })
  emailVerifyCode: string;

  @Prop({ type: Date, required: false })
  verifySendDate: Date;

  @Prop({ type: String, required: false })
  forgotPasswordCode: string;

  @Prop({ type: Date, required: false })
  forgotPasswordSendDate: Date;

  @Prop({ type: String, required: false, default: 'user' })
  role: 'user' | 'super-admin' | 'admin';

  @Prop({ type: String, required: false })
  profilePicture: string;

  @Prop({ type: Date, required: false, default: new Date() })
  createdAt: Date;

  @Prop({ type: Date, required: false, default: new Date() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
