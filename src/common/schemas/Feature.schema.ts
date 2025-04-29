import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FeatureDocument = HydratedDocument<Feature>;

@Schema({ timestamps: true, collection: 'features' })
export class Feature {
  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  name: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  labels?: Map<string, string>;

  @Prop({ type: String, required: true })
  iconUrl: string;

  @Prop({
    type: String,
    enum: ['inside', 'outside', 'general'],
    required: true,
  })
  featureType: string;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
