import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HotelDocument = HydratedDocument<Hotel>;

// --- Subschemas ---
@Schema({ _id: false })
class DistanceSubSchema {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: false }) // No ref needed as per requirement
  typeId: Types.ObjectId;

  @Prop({ type: Number, required: false })
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
  @Prop({ type: String, enum: ['Point'], required: false, default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: false }) // [longitude, latitude]
  coordinates: number[];
}

// Define image schema for ordered images
@Schema({ _id: false })
class ImageSubSchema {
  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: Number, required: true })
  order: number;
}

// --- Main Hotel Schema ---
@Schema({ timestamps: true, collection: 'hotels' })
export class Hotel {
  @Prop({ type: Number, required: false })
  no: number;

  @Prop({
    type: [String],
    required: false,
  })
  faces: ('west' | 'east' | 'south' | 'north')[];

  @Prop({ type: String, unique: true, required: false })
  slug: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, required: false })
  slugs: Map<string, string>; // Support for multiple language slugs (tr, en)

  @Prop({ type: MongooseSchema.Types.Map, of: String, required: false })
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
  neighborhood?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  street?: Map<string, string>;

  @Prop({ type: String })
  adaNo?: string;

  @Prop({ type: String })
  parselNo?: string;

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

  @Prop({ type: [ImageSubSchema] })
  images?: ImageSubSchema[];

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
  bedRoomCount?: number; // Yatak Odası Sayısı (Sonradan değiştirildi)

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  floorType?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  housingType?: Map<string, string>;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  entranceType?: Map<string, string>;

  @Prop({
    type: MongooseSchema.Types.Map,
    of: String,
    default: {
      tr: 'Satılık',
      en: 'For Sale',
    },
  })
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

  // New fields
  @Prop({ type: Boolean })
  exchangeable?: boolean; // Takaslı

  @Prop({ type: MongooseSchema.Types.Mixed })
  creditEligible?: any; // Krediye Uygunluk

  @Prop({ type: Number })
  buildingAge?: number; // Bina Yaşı

  @Prop({ type: Boolean })
  isFurnished?: boolean; // Eşyalı

  @Prop({ type: MongooseSchema.Types.Mixed })
  dues?: any;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  usageStatus?: Map<string, string>; // Kullanım Durumu

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  deedStatus?: Map<string, string>; // Tapu Durumu

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  heatingType?: Map<string, string>; // Isıtma

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  source?: Map<string, string>; // Kimden

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  generalFeatures?: Map<string, string>; // Genel Özellikler

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  zoningStatus?: Map<string, string>; // İmar Durumu

  @Prop({ type: Array })
  infrastructureFeatureIds: string[];

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  floorPosition?: Map<string, string>; //Bulunduğu Kat

  @Prop({ type: Array })
  viewIds: string[];
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);

// Add 2dsphere index for location
HotelSchema.index({ 'location.coordinates': '2dsphere' });
