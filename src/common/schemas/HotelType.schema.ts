import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type HotelTypeDocument = HydratedDocument<HotelType>;

@Schema({ timestamps: true, collection: 'hotelTypes' })
export class HotelType {
  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  name: Map<string, string>;
}

export const HotelTypeSchema = SchemaFactory.createForClass(HotelType);
