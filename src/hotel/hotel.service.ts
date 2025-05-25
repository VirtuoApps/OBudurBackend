import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hotel, HotelDocument } from '../common/schemas/Hotel.schema';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { FilterHotelDto } from './dto/filter-hotel.dto';
import slugify from 'slugify';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';
import { Feature, FeatureDocument } from 'src/common/schemas/Feature.schema';
import {
  DistanceType,
  DistanceTypeDocument,
} from 'src/common/schemas/DistanceType.schema';
import { User, UserDocument } from 'src/common/schemas/Users.schema';
import {
  HotelMessages,
  HotelMessagesDocument,
} from 'src/common/schemas/HotelMessages.schema';
import { GetHotelsDto } from './dto/get-hotels.dto';
// Import related services if validation is needed
// import { FeatureService } from '../feature/feature.service';
// import { DistanceTypeService } from '../distancetype/distancetype.service';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>, // Inject related services if needed for validation // private readonly featureService: FeatureService, // private readonly distanceTypeService: DistanceTypeService,
    @InjectModel(Feature.name) private featureModel: Model<FeatureDocument>,
    @InjectModel(DistanceType.name)
    private distanceTypeModel: Model<DistanceTypeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(HotelMessages.name)
    private hotelMessagesModel: Model<HotelMessagesDocument>,
  ) {}

  async increaseViewCount(hotelId: string) {
    const hotel = await this.hotelModel.findByIdAndUpdate(
      hotelId,
      {
        $inc: { viewCount: 1 },
      },
      {
        new: true,
      },
    );
    return hotel;
  }

  async getHotelBySlug(slug: string) {
    const hotel = await this.hotelModel.findOne({ slug });
    if (!hotel) {
      throw new NotFoundException(`Hotel with slug ${slug} not found`);
    }

    const generalFeatures = await this.featureModel.find({
      featureType: 'general',
      _id: { $in: hotel.featureIds },
    });

    const insideFeatures = await this.featureModel.find({
      featureType: 'inside',
      _id: { $in: hotel.featureIds },
    });

    const outsideFeatures = await this.featureModel.find({
      featureType: 'outside',
      _id: { $in: hotel.featureIds },
    });

    const allDistances = await this.distanceTypeModel.find({
      _id: { $in: hotel.distances.map((d) => d.typeId) },
    });

    const populatedDistances = [];

    hotel.distances.forEach((d) => {
      const distance = allDistances.find((ad) => ad._id.equals(d.typeId));
      if (distance) {
        populatedDistances.push({
          ...distance.toObject(),
          name: distance.name,
          value: d.value,
        });
      }
    });

    const manager = await this.userModel.findById(hotel.managerId);

    return {
      hotelDetails: hotel,
      populatedData: {
        generalFeatures,
        insideFeatures,
        outsideFeatures,
        distances: populatedDistances,
      },
      manager,
    };
  }

  async getMineHotels(userId: string): Promise<Array<any>> {
    const user = await this.userModel.findById(userId);

    // Define query based on user role
    const query = user.role === 'super-admin' ? {} : { managerId: userId };

    // Get hotels based on the query
    const hotels = await this.hotelModel.find(query).lean();

    if (hotels.length === 0) {
      return [];
    }

    // Get hotel IDs for message lookup
    const hotelIds = hotels.map((h) => h._id);

    // Get all messages first to ensure we're finding them
    const allInitialMessages = await this.hotelMessagesModel.find({
      hotelId: { $in: hotelIds },
      isInitialMessage: true,
    });

    // Create a map to count messages per hotel
    const messageCountMap = new Map();

    allInitialMessages.forEach((message) => {
      const hotelIdStr = message.hotelId.toString();
      messageCountMap.set(
        hotelIdStr,
        (messageCountMap.get(hotelIdStr) || 0) + 1,
      );
    });

    // Add message count to each hotel
    return hotels.map((hotel) => ({
      ...hotel,
      totalMessageCount: messageCountMap.get(hotel._id.toString()) || 0,
    }));
  }

  async dummyData() {
    const refData = await this.hotelModel.findById('68298fced3d03375075bc4d7');

    const housingTypes = [
      {
        tr: 'Konut',
        en: 'Housing',
      },
      {
        tr: 'İş Yeri',
        en: 'Office',
      },
      {
        tr: 'Arsa',
        en: 'Land',
      },
      {
        tr: 'Ticaret',
        en: 'Commercial',
      },
    ];

    const listingTypes = [
      {
        tr: 'Satılık',
        en: 'For Sale',
      },
      {
        tr: 'Kiralık',
        en: 'For Rent',
      },
    ];

    const roomAsTextOptions = ['1+1', '2+1', '3+1', '4+1'];

    await this.hotelModel.deleteMany({
      _id: { $ne: '68298fced3d03375075bc4d7' },
    });

    const allFeatures = await this.featureModel.find({});

    //Create same 20 data with name Hotel 1 Hotel 2... and coordinates changing like from 45 to 44, 44 to 43, they need to be close to each other
    const hotels = [];
    for (let i = 1; i <= 100; i++) {
      //Give random 10 featureIds
      const featureIds = allFeatures
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map((f) => f._id);

      //Select random housing type
      const housingType =
        housingTypes[Math.floor(Math.random() * housingTypes.length)];

      //Random listing type
      const listingType =
        listingTypes[Math.floor(Math.random() * listingTypes.length)];

      //Random roomAsText
      const roomAsText =
        roomAsTextOptions[Math.floor(Math.random() * roomAsTextOptions.length)];

      const hotel = {
        ...refData.toObject(),
        featureIds,
        _id: undefined,
        housingType,
        listingType,
        roomAsText,
        roomCount: Math.floor(Math.random() * 5) + 1,
        bathroomCount: Math.floor(Math.random() * 3) + 1,
        balconyCount: Math.floor(Math.random() * 3) + 1,
        bedRoomCount: Math.floor(Math.random() * 3) + 1,
        floorCount: Math.floor(Math.random() * 3) + 1,
        slug: slugify(`Hotel ${i}`, { lower: true, strict: true }),
        title: {
          tr: `Hotel ${i}`,
          en: `Hotel ${i}`,
        },
        location: {
          type: 'Point',
          coordinates: [
            refData.location.coordinates[0] -
              i * 0.005 +
              (Math.random() * 0.002 - 0.001),
            refData.location.coordinates[1] +
              i * 0.005 +
              (Math.random() * 0.002 - 0.001),
          ],
        },
      };
      hotels.push(hotel);
    }

    return await this.hotelModel.insertMany(hotels);
  }

  async getFilterOptions() {
    // We'll use a more direct approach to get all the map field values
    // First, retrieve all documents with at least one of our fields
    const hotels = await this.hotelModel
      .find({
        $or: [
          { housingType: { $exists: true, $ne: null } },
          { floorType: { $exists: true, $ne: null } },
          { city: { $exists: true, $ne: null } },
          { country: { $exists: true, $ne: null } },
          { roomAsText: { $exists: true, $ne: null } },
          { state: { $exists: true, $ne: null } },
          { roomCount: { $exists: true, $ne: null } },
          { bathroomCount: { $exists: true, $ne: null } },
          { entranceType: { $exists: true, $ne: null } },
        ],
      })
      .lean();

    const interiorFeatures = await this.featureModel.find({
      featureType: 'inside',
    });

    const outsideFeatures = await this.featureModel.find({
      featureType: 'outside',
    });

    const accessibilityFeatures = await this.featureModel.find({
      featureType: 'for-olds-and-disabled',
    });

    const faceFeatures = await this.featureModel.find({
      featureType: 'face',
    });

    const generalFeatures = await this.featureModel.find({
      featureType: 'general',
    });

    // Initialize collections for unique values
    const housingTypes = new Map();
    const floorTypes = new Map();
    const uniqueCities = new Map(); // Global list of unique cities
    const uniqueCountries = new Map(); // Global list of unique countries
    const roomAsTextSet = new Set();
    const uniqueStates = new Map(); // Global list of unique states
    const roomCountSet = new Set();
    const bathroomCountSet = new Set();
    const entranceTypeSet = new Map();

    // Map to store country-specific details (cities and states)
    const countryDetailsMap = new Map<
      string,
      { countryObj: any; cities: Map<string, any>; states: Map<string, any> }
    >();

    // Process each hotel to extract the values
    hotels.forEach((hotel) => {
      // Process housing type
      if (
        hotel.housingType &&
        !housingTypes.has(JSON.stringify(hotel.housingType))
      ) {
        const key = JSON.stringify(hotel.housingType);
        housingTypes.set(key, hotel.housingType);
      }

      // Process floor type
      if (hotel.floorType && !floorTypes.has(JSON.stringify(hotel.floorType))) {
        const key = JSON.stringify(hotel.floorType);
        floorTypes.set(key, hotel.floorType);
      }

      // Process roomAsText
      if (hotel.roomAsText && !roomAsTextSet.has(hotel.roomAsText)) {
        roomAsTextSet.add(hotel.roomAsText);
      }

      // Process roomCount
      if (hotel.roomCount && !roomCountSet.has(hotel.roomCount)) {
        roomCountSet.add(hotel.roomCount);
      }

      // Process bathroomCount
      if (hotel.bathroomCount && !bathroomCountSet.has(hotel.bathroomCount)) {
        bathroomCountSet.add(hotel.bathroomCount);
      }

      // Process entrance type
      if (
        hotel.entranceType &&
        !entranceTypeSet.has(JSON.stringify(hotel.entranceType))
      ) {
        const key = JSON.stringify(hotel.entranceType);
        entranceTypeSet.set(key, hotel.entranceType);
      }

      // Process global list of unique states
      if (hotel.state) {
        const stateKey = JSON.stringify(hotel.state);
        if (!uniqueStates.has(stateKey)) {
          uniqueStates.set(stateKey, {
            ...hotel.state,
            cityOfTheState: hotel.city,
            countryOfTheState: hotel.country,
          });
        }
      }

      // Process country, city, and state for structured locations
      if (hotel.country) {
        const countryKey = JSON.stringify(hotel.country);

        // Populate global list of unique countries
        if (!uniqueCountries.has(countryKey)) {
          uniqueCountries.set(countryKey, hotel.country);
        }

        // Ensure country entry exists in countryDetailsMap
        if (!countryDetailsMap.has(countryKey)) {
          countryDetailsMap.set(countryKey, {
            countryObj: hotel.country,
            cities: new Map(),
            states: new Map(),
          });
        }
        const countryEntry = countryDetailsMap.get(countryKey)!;

        // Process city for this country
        if (hotel.city) {
          const cityKey = JSON.stringify(hotel.city);
          // Populate global list of unique cities
          if (!uniqueCities.has(cityKey)) {
            uniqueCities.set(cityKey, hotel.city);
          }
          // Add city to the current country's cities list if not already present
          if (!countryEntry.cities.has(cityKey)) {
            countryEntry.cities.set(cityKey, hotel.city);
          }
        }

        // Process state for this country
        if (hotel.state) {
          const stateKey = JSON.stringify(hotel.state);
          // Add state to the current country's states list if not already present
          if (!countryEntry.states.has(stateKey)) {
            countryEntry.states.set(stateKey, hotel.state);
          }
        }
      } else {
        // If hotel has no country, but has a city, add to global uniqueCities list
        if (hotel.city) {
          const cityKey = JSON.stringify(hotel.city);
          if (!uniqueCities.has(cityKey)) {
            uniqueCities.set(cityKey, hotel.city);
          }
        }
        // hotel.state is already handled for uniqueStates if it exists
      }
    });

    // Build locations array
    const locations = [];
    countryDetailsMap.forEach((details) => {
      locations.push({
        country: details.countryObj,
        cities: Array.from(details.cities.values()),
        states: Array.from(details.states.values()), // Added states here
      });
    });

    //Sort roomcount from lowest to highest
    const sortedRoomCount = Array.from(roomCountSet).sort(
      (a, b) => Number(a) - Number(b),
    );

    //Sort bathroomcount from lowest to highest
    const sortedBathroomCount = Array.from(bathroomCountSet).sort(
      (a, b) => Number(a) - Number(b),
    );

    // Return the collected unique values
    return {
      city: Array.from(uniqueCities.values()),
      country: Array.from(uniqueCountries.values()),
      housingType: Array.from(housingTypes.values()),
      floorType: Array.from(floorTypes.values()),
      roomAsText: Array.from(roomAsTextSet),
      locations, // Now includes states per country
      state: Array.from(uniqueStates.values()), // Global list of unique states
      roomCount: sortedRoomCount,
      bathroomCount: sortedBathroomCount,
      interiorFeatures: Array.from(interiorFeatures.values()),
      outsideFeatures: Array.from(outsideFeatures.values()),
      generalFeatures: Array.from(generalFeatures.values()),
      accessibilityFeatures: Array.from(accessibilityFeatures.values()),
      faceFeatures: Array.from(faceFeatures.values()),
      entranceType: Array.from(entranceTypeSet.values()),
    };
  }

  async create(createHotelDto: CreateHotelDto, userId: string): Promise<Hotel> {
    // TODO: Add validation if featureIds and distanceTypeIds exist in their respective collections
    // Requires injecting FeatureService and DistanceTypeService
    // await this.validateRelations(createHotelDto.featureIds, createHotelDto.distances?.map(d => d.typeId));

    const manager = await this.userModel.findById(userId);

    let hotelNo = Math.floor(100000000 + Math.random() * 900000000).toString();

    let isExists = true;

    while (isExists) {
      const hotel = await this.hotelModel.findOne({ no: hotelNo });
      if (hotel) {
        hotelNo = Math.floor(100000000 + Math.random() * 900000000).toString();
      } else {
        isExists = false;
      }
    }

    const slug = slugify(createHotelDto.title.en, {
      lower: true,
      strict: true,
    });

    // Convert DTO Maps (Record<string, string>) back to actual Maps
    const hotelData: any = {
      ...createHotelDto,
      no: hotelNo,
      slug,
      title: new Map(Object.entries(createHotelDto.title)),
      description: createHotelDto.description
        ? new Map(Object.entries(createHotelDto.description))
        : undefined,
      address: createHotelDto.address
        ? new Map(Object.entries(createHotelDto.address))
        : undefined,
      // Convert ObjectId strings back to ObjectId types
      featureIds: createHotelDto.featureIds?.map(
        (id) => new Types.ObjectId(id),
      ),
      distances: createHotelDto.distances?.map((d) => ({
        ...d,
        typeId: new Types.ObjectId(d.typeId),
      })),
      // Location is already in correct format via DTO
    };

    try {
      const createdHotel = new this.hotelModel({
        ...hotelData,
        isConfirmedByAdmin: manager.role === 'super-admin' ? true : false,
        managerId: new Types.ObjectId(userId),
      });
      return await createdHotel.save();
    } catch (error) {
      // Handle potential duplicate slug error etc.
      if (error.code === 11000) {
        // Mongo duplicate key error
        throw new BadRequestException(
          `Duplicate key error: ${Object.keys(error.keyValue).join(', ')}`,
        );
      }
      throw error;
    }
  }

  async confirmHotel(hotelId: string) {
    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }
    hotel.isConfirmedByAdmin = true;
    await hotel.save();
    return hotel;
  }

  async disableConfirmHotel(hotelId: string) {
    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${hotelId} not found`);
    }
    hotel.isConfirmedByAdmin = false;
    await hotel.save();
    return hotel;
  }

  async findAll(
    query: queryType,
    extraFilters: {
      isConfirmedByAdmin?: boolean;
      isPublished?: boolean;
    },
    getHotelsDto?: GetHotelsDto,
  ) {
    let extraQueries: any = {};

    if (extraFilters.isConfirmedByAdmin === false) {
      extraQueries = {
        ...extraQueries,
        isConfirmedByAdmin: {
          $ne: true,
        },
        isPublished: {
          $ne: false,
        },
      };
    }

    if (extraFilters.isConfirmedByAdmin === true) {
      extraQueries = {
        ...extraQueries,
        isConfirmedByAdmin: true,
        isPublished: {
          $ne: false,
        },
      };
    }

    if (extraFilters.isPublished === false) {
      extraQueries = {
        ...extraQueries,
        isPublished: {
          $ne: true,
        },
      };
    }

    if (getHotelsDto?.listingType) {
      extraQueries = {
        ...extraQueries,
        'listingType.tr': { $regex: getHotelsDto.listingType, $options: 'i' },
      };
    }

    if (getHotelsDto?.housingType) {
      extraQueries = {
        ...extraQueries,
        'housingType.tr': { $regex: getHotelsDto.housingType, $options: 'i' },
      };
    }

    if (getHotelsDto?.entranceType) {
      extraQueries = {
        ...extraQueries,
        'entranceType.tr': { $regex: getHotelsDto.entranceType, $options: 'i' },
      };
    }

    // Consider adding pagination later
    return await generalPaginate({
      model: this.hotelModel,
      query,
      searchFields: ['title.en', 'title.tr'],
      extraQueries,
    });
  }

  async findOne(id: string): Promise<Hotel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Hotel ID: ${id}`);
    }
    const hotel = await this.hotelModel.findById(id).exec();
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
  }

  async update(id: string, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Hotel ID: ${id}`);
    }

    // TODO: Add validation if updated featureIds/distanceTypeIds exist
    // await this.validateRelations(updateHotelDto.featureIds, updateHotelDto.distances?.map(d => d.typeId));

    // Convert DTO Maps (Record<string, string>) back to actual Maps if present
    const updateData: any = { ...updateHotelDto };
    if (updateHotelDto.title) {
      updateData.title = new Map(Object.entries(updateHotelDto.title));
    }
    if (updateHotelDto.description) {
      updateData.description = new Map(
        Object.entries(updateHotelDto.description),
      );
    }
    if (updateHotelDto.address) {
      updateData.address = new Map(Object.entries(updateHotelDto.address));
    }
    // Convert ObjectId strings back to ObjectId types if present
    if (updateHotelDto.featureIds) {
      updateData.featureIds = updateHotelDto.featureIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateHotelDto.distances) {
      updateData.distances = updateHotelDto.distances
        .map((d) => ({
          ...d,
          typeId: d.typeId ? new Types.ObjectId(d.typeId) : undefined, // Handle optional typeId in update
        }))
        .filter((d) => d.typeId && d.value !== undefined); // Filter out incomplete distance updates if needed
    }

    try {
      const updatedHotel = await this.hotelModel
        .findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .exec();

      if (!updatedHotel) {
        throw new NotFoundException(`Hotel with ID ${id} not found`);
      }
      return updatedHotel;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Duplicate key error: ${Object.keys(error.keyValue).join(', ')}`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Hotel ID: ${id}`);
    }
    const result = await this.hotelModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return { deleted: true };
  }

  async filterHotels(filterDto: FilterHotelDto): Promise<Hotel[]> {
    const query: any = {
      isPublished: {
        $ne: false,
      },
    };

    // Apply basic filters
    if (filterDto.slug) {
      query.slug = filterDto.slug;
    }

    if (filterDto.title) {
      Object.entries(filterDto.title).forEach(([lang, value]) => {
        query[`title.${lang}`] = { $regex: value, $options: 'i' };
      });
    }

    if (filterDto.featureIds && filterDto.featureIds.length > 0) {
      query.featureIds = {
        $all: filterDto.featureIds.map((id) => new Types.ObjectId(id)),
      };
    }

    // Range filters
    if (
      filterDto.minRoomCount !== undefined ||
      filterDto.maxRoomCount !== undefined
    ) {
      query.roomCount = {};
      if (filterDto.minRoomCount !== undefined) {
        query.roomCount.$gte = filterDto.minRoomCount;
      }
      if (filterDto.maxRoomCount !== undefined) {
        query.roomCount.$lte = filterDto.maxRoomCount;
      }
    }

    if (
      filterDto.minBathroomCount !== undefined ||
      filterDto.maxBathroomCount !== undefined
    ) {
      query.bathroomCount = {};
      if (filterDto.minBathroomCount !== undefined) {
        query.bathroomCount.$gte = filterDto.minBathroomCount;
      }
      if (filterDto.maxBathroomCount !== undefined) {
        query.bathroomCount.$lte = filterDto.maxBathroomCount;
      }
    }

    if (
      filterDto.minBedRoomCount !== undefined ||
      filterDto.maxBedRoomCount !== undefined
    ) {
      query.bedRoomCount = {};
      if (filterDto.minBedRoomCount !== undefined) {
        query.bedRoomCount.$gte = filterDto.minBedRoomCount;
      }
      if (filterDto.maxBedRoomCount !== undefined) {
        query.bedRoomCount.$lte = filterDto.maxBedRoomCount;
      }
    }

    if (
      filterDto.minTotalSize !== undefined ||
      filterDto.maxTotalSize !== undefined
    ) {
      query.totalSize = {};
      if (filterDto.minTotalSize !== undefined) {
        query.totalSize.$gte = filterDto.minTotalSize;
      }
      if (filterDto.maxTotalSize !== undefined) {
        query.totalSize.$lte = filterDto.maxTotalSize;
      }
    }

    if (
      filterDto.minBuildYear !== undefined ||
      filterDto.maxBuildYear !== undefined
    ) {
      query.buildYear = {};
      if (filterDto.minBuildYear !== undefined) {
        query.buildYear.$gte = filterDto.minBuildYear;
      }
      if (filterDto.maxBuildYear !== undefined) {
        query.buildYear.$lte = filterDto.maxBuildYear;
      }
    }

    // Price filter with currency
    if (filterDto.minPrice !== undefined || filterDto.maxPrice !== undefined) {
      const priceFilter: any = {};

      if (filterDto.currency) {
        priceFilter['price.currency'] = filterDto.currency;
      }

      if (filterDto.minPrice !== undefined) {
        priceFilter['price.amount'] = { $gte: filterDto.minPrice };
      }

      if (filterDto.maxPrice !== undefined) {
        if (priceFilter['price.amount']) {
          priceFilter['price.amount'].$lte = filterDto.maxPrice;
        } else {
          priceFilter['price.amount'] = { $lte: filterDto.maxPrice };
        }
      }

      query.$or = [{ price: { $elemMatch: priceFilter } }];
    }

    // Listing type filter
    if (filterDto.listingType) {
      Object.entries({ en: filterDto.listingType }).forEach(([lang, value]) => {
        query[`listingType.${lang}`] = { $regex: value, $options: 'i' };
      });
    }

    // Geo filter
    if (filterDto.coordinates && filterDto.maxDistance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: filterDto.coordinates,
          },
          $maxDistance: filterDto.maxDistance * 1000, // Convert km to meters
        },
      };
    }

    // Search functionality
    if (filterDto.search) {
      const searchRegex = { $regex: filterDto.search, $options: 'i' };
      const searchQuery = {
        $or: [
          { 'title.en': searchRegex },
          { 'title.tr': searchRegex },
          { 'description.en': searchRegex },
          { 'description.tr': searchRegex },
          { 'address.en': searchRegex },
          { 'address.tr': searchRegex },
        ],
      };

      // Combine search with existing query
      query.$and = query.$and || [];
      query.$and.push(searchQuery);
    }

    return this.hotelModel.find(query).exec();
  }

  // --- Helper for Relation Validation (Example) ---
  /*
  private async validateRelations(featureIds?: string[], distanceTypeIds?: string[]): Promise<void> {
    if (featureIds && featureIds.length > 0) {
      const validIds = featureIds.map(id => new Types.ObjectId(id));
      const count = await this.featureService.countByIds(validIds); // Assumes countByIds method exists
      if (count !== featureIds.length) {
        throw new BadRequestException('One or more featureIds are invalid.');
      }
    }
    if (distanceTypeIds && distanceTypeIds.length > 0) {
      const validIds = distanceTypeIds.filter(id => !!id).map(id => new Types.ObjectId(id!));
      if (validIds.length > 0) {
         const count = await this.distanceTypeService.countByIds(validIds); // Assumes countByIds method exists
         if (count !== validIds.length) {
             throw new BadRequestException('One or more distance typeIds are invalid.');
         }
      }
    }
  }
  */
}
