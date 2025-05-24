import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FeatureDocument = HydratedDocument<Feature>;

@Schema({ timestamps: true, collection: 'features' })
export class Feature {
  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  name: Map<string, string>;

  @Prop({ type: String, required: true })
  iconUrl: string;

  @Prop({
    type: String,
    enum: ['inside', 'outside', 'general'],
    required: true,
  })
  featureType: string;

  @Prop({ type: Boolean, required: true, default: false })
  isQuickFilter: boolean;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
