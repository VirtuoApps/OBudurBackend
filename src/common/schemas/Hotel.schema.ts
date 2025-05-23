import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

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

// Define location schema directly in Hotel schema
@Schema({ _id: false })
class LocationSubSchema {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}

// --- Main Hotel Schema ---
@Schema({ timestamps: true, collection: 'hotels' })
export class Hotel {
  @Prop({ type: Number, required: true })
  no: number;

  @Prop({
    type: String,
    required: true,
    enum: ['west', 'east', 'south', 'north'],
  })
  face: 'west' | 'east' | 'south' | 'north';

  @Prop({ type: String, unique: true, required: true })
  slug: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, required: true })
  title: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  description?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  address?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  country?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  city?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  state?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  street?: Map<string, string>;

  @Prop({ type: String })
  buildingNo?: string;

  @Prop({ type: String, of: String })
  apartmentNo?: string;

  @Prop({ type: String })
  postalCode?: string;

  @Prop({ type: Number })
  floorCount?: number;

  @Prop({ type: [PriceSubSchema] })
  price?: PriceSubSchema[];

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

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  kitchenType?: Map<string, string>;

  @Prop({ type: Number })
  roomCount?: number;

  @Prop({ type: Number })
  bathroomCount?: number;

  @Prop({ type: Number })
  balconyCount?: number;

  @Prop({ type: Number })
  bedRoomCount?: number;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  floorType?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  housingType?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  entranceType?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  listingType?: Map<string, string>;

  /* Relational fields (raw ObjectId) */
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }] })
  featureIds?: Types.ObjectId[];

  @Prop({ type: [DistanceSubSchema] })
  distances?: DistanceSubSchema[];

  // Location defined directly in the schema instead of referencing GeoPoint
  @Prop({ type: LocationSubSchema })
  location?: LocationSubSchema;

  @Prop({ type: [MongooseSchema.Types.Mixed] }) // For documents
  documents?: any[];

  @Prop({ type: MongooseSchema.Types.ObjectId })
  managerId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isPublished?: boolean;

  @Prop({ type: String })
  video?: string;

  @Prop({ type: Boolean, default: false })
  isConfirmedByAdmin?: boolean;

  @Prop({ type: Number, default: 0 })
  viewCount?: number;

  @Prop({ type: Number, default: 0 })
  favoriteCount?: number;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'sold', 'stopped', 'optioned'],
  })
  status?: string;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);

// Add 2dsphere index for location
HotelSchema.index({ 'location.coordinates': '2dsphere' });
