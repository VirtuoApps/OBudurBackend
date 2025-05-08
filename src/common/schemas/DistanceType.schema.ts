import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type DistanceTypeDocument = HydratedDocument<DistanceType>;

@Schema({ timestamps: true, collection: 'distance_types' })
export class DistanceType {
  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  name: Map<string, string>;

  @Prop({ type: String })
  iconUrl?: string;

  @Prop({ type: String, enum: ['m', 'km'], default: 'm' })
  unit: string;
}

export const DistanceTypeSchema = SchemaFactory.createForClass(DistanceType);
