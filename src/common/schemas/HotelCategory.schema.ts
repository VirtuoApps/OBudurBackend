import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type HotelCategoryDocument = HydratedDocument<HotelCategory>;

@Schema({ timestamps: true, collection: 'hotelCategories' })
export class HotelCategory {
  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  name: Map<string, string>;
}

export const HotelCategorySchema = SchemaFactory.createForClass(HotelCategory);
