import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DistanceTypeDocument = HydratedDocument<DistanceType>;

@Schema({ timestamps: true, collection: 'distance_types' })
export class DistanceType {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  iconUrl?: string;

  @Prop({ type: String, enum: ['m', 'km'], default: 'm' })
  unit: string;
}

export const DistanceTypeSchema = SchemaFactory.createForClass(DistanceType);
