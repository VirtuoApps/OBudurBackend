import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type FeatureDocument = HydratedDocument<Feature>;

@Schema({ timestamps: true, collection: 'features' })
export class Feature {
  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  name: Map<string, string>;

  @Prop({ type: String, required: false })
  iconUrl?: string;

  @Prop({
    type: String,
    enum: [
      'inside',
      'outside',
      'general',
      'for-olds-and-disabled',
      'face',
      'infrastructure',
      'scenery',
    ],
    required: true,
  })
  featureType: string;

  @Prop({
    type: String,
    enum: ['house', 'office', 'land', 'other', 'all'],
    required: false,
  })
  housingType: string;

  @Prop({ type: Boolean, required: true, default: false })
  isQuickFilter: boolean;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
