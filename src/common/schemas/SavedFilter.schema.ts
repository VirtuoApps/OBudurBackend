import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  HydratedDocument,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';

export type SavedFilterDocument = HydratedDocument<SavedFilter>;

// Define the FeatureType interface for validation
export interface FeatureType {
  _id: string;
  name: string;
  iconUrl: string;
  featureType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Define the LocationType interface for validation
export interface LocationType {
  name: string;
  description: string;
  coordinates: [number, number]; // [longitude, latitude]
}

@Schema({ timestamps: true, collection: 'saved_filters' })
export class SavedFilter {
  @Prop({ type: String, required: true })
  filterName: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Boolean, default: false })
  enableNotifications: boolean;

  @Prop({ type: Boolean, default: false })
  enableMailNotifications: boolean;

  // Filter properties
  @Prop({ type: String, default: null })
  listingType: string | null;

  @Prop({ type: String, default: null })
  state: string | null;

  @Prop({ type: String, default: null })
  propertyType: string | null;

  @Prop({ type: String, default: null })
  propertyTypeId: string | null;

  @Prop({ type: String, default: null })
  roomAsText: string | null;

  @Prop({ type: String, default: null })
  categoryId: string | null;

  @Prop({ type: Number, default: null })
  minPrice: number | null;

  @Prop({ type: Number, default: null })
  maxPrice: number | null;

  @Prop({ type: Number, default: null })
  roomCount: number | null;

  @Prop({ type: Number, default: null })
  bathroomCount: number | null;

  @Prop({ type: Number, default: null })
  minProjectArea: number | null;

  @Prop({ type: Number, default: null })
  maxProjectArea: number | null;

  @Prop({ type: [String], default: null })
  interiorFeatureIds: string[] | null;

  @Prop({ type: [String], default: null })
  exteriorFeatureIds: string[] | null;

  @Prop({ type: [String], default: null })
  accessibilityFeatureIds: string[] | null;

  @Prop({ type: [String], default: null })
  faceFeatureIds: string[] | null;

  @Prop({ type: [String], default: null })
  locationFeatureIds: string[] | null;

  @Prop({ type: Boolean, default: null })
  isNewSelected: boolean | null;

  @Prop({ type: Boolean, default: null })
  isOnePlusOneSelected: boolean | null;

  @Prop({ type: Boolean, default: null })
  isTwoPlusOneSelected: boolean | null;

  @Prop({ type: Boolean, default: null })
  isThreePlusOneSelected: boolean | null;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  selectedFeatures: FeatureType[];

  @Prop({
    type: mongoose.Schema.Types.Mixed,
    default: null,
  })
  selectedLocation: LocationType | null;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const SavedFilterSchema = SchemaFactory.createForClass(SavedFilter);
