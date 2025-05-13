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
import slugify from 'slugify';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';
// Import related services if validation is needed
// import { FeatureService } from '../feature/feature.service';
// import { DistanceTypeService } from '../distancetype/distancetype.service';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>, // Inject related services if needed for validation // private readonly featureService: FeatureService, // private readonly distanceTypeService: DistanceTypeService,
  ) {}

  async dummyData() {
    const refData = await this.hotelModel.findById('681c7584b512c1249196b08f');

    //Create same 20 data with name Hotel 1 Hotel 2... and coordinates changing like from 45 to 44, 44 to 43, they need to be close to each other
    const hotels = [];
    for (let i = 1; i <= 100; i++) {
      const hotel = {
        ...refData.toObject(),
        _id: undefined,
        slug: slugify(`Hotel ${i}`, { lower: true, strict: true }),
        title: {
          tr: `Hotel ${i}`,
          en: `Hotel ${i}`,
        },
        location: {
          type: 'Point',
          coordinates: [45 - i, 40],
        },
      };
      hotels.push(hotel);
    }

    return await this.hotelModel.insertMany(hotels);
  }

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    // TODO: Add validation if featureIds and distanceTypeIds exist in their respective collections
    // Requires injecting FeatureService and DistanceTypeService
    // await this.validateRelations(createHotelDto.featureIds, createHotelDto.distances?.map(d => d.typeId));

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
      const createdHotel = new this.hotelModel(hotelData);
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

  async findAll(query: queryType) {
    // Consider adding pagination later
    return await generalPaginate({
      model: this.hotelModel,
      query,
      searchFields: ['title.en', 'title.tr'],
      extraQueries: {},
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
