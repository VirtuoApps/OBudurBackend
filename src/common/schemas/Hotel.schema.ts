import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { GeoPoint, GeoPointSchema } from './GeoPoint.schema';

export type HotelDocument = HydratedDocument<Hotel>;

// --- Subschemas ---
@Schema({ _id: false })
class DistanceSubSchema {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true }) // No ref needed as per requirement
  typeId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  value: number;
}

@Schema({ _id: false })
class PriceSubSchema {
  @Prop({ type: Number })
  amount?: number;

  @Prop({ type: String, default: 'USD' })
  currency: string;
}

// --- Main Hotel Schema ---
@Schema({ timestamps: true, collection: 'hotels' })
export class Hotel {
  @Prop({ type: Number, required: true })
  no: number;

  @Prop({ type: String, unique: true, required: true })
  slug: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  title: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  description?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  address?: Map<string, string>;

  @Prop({ type: PriceSubSchema })
  price?: PriceSubSchema;

  @Prop({ type: [String] })
  images?: string[];

  /* Details */
  @Prop({ type: String })
  roomAsText?: string;

  @Prop({ type: Number })
  projectArea?: number;

  @Prop({ type: Number })
  totalSize?: number;

  @Prop({ type: Number })
  buildYear?: number;

  @Prop({ type: String })
  architect?: string;

  @Prop({ type: String })
  kitchenType?: string;

  @Prop({ type: Number })
  roomCount?: number;

  @Prop({ type: Number })
  bathroomCount?: number;

  @Prop({ type: Number })
  balconyCount?: number;

  @Prop({ type: Number })
  bedRoomCount?: number;

  @Prop({ type: String })
  floorType?: string;

  @Prop({ type: String })
  housingType?: string;

  @Prop({ type: String })
  entranceType?: string;

  @Prop({ type: String })
  listingType?: string;

  /* Relational fields (raw ObjectId) */
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }] })
  featureIds?: Types.ObjectId[];

  @Prop({ type: [DistanceSubSchema] })
  distances?: DistanceSubSchema[];

  @Prop({ type: GeoPointSchema })
  location?: GeoPoint;

  @Prop({ type: String })
  locationAsString?: string;

  @Prop({ type: [MongooseSchema.Types.Mixed] }) // For documents
  documents?: any[];
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);

// Add 2dsphere index for location
HotelSchema.index({ location: '2dsphere' });
