import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LanguageDocument = HydratedDocument<Language>;

@Schema({ timestamps: true, collection: 'languages' })
export class Language {
  @Prop({ type: String, unique: true, required: true })
  code: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  nativeName: string;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
