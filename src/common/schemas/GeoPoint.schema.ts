import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GeoPointDocument = HydratedDocument<GeoPoint>;

@Schema({ _id: false }) // No separate ID for this subdocument
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true, index: '2dsphere' }) // [longitude, latitude]
  coordinates: number[];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);
