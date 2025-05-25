import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  HotelType,
  HotelTypeDocument,
} from '../common/schemas/HotelType.schema';
import { CreateHotelTypeDto } from './dto/create-hotel-type.dto';
import { UpdateHotelTypeDto } from './dto/update-hotel-type.dto';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';
import { GetHotelTypesDto } from './dto/get-hotel-types.dto';

@Injectable()
export class HotelTypesService {
  constructor(
    @InjectModel(HotelType.name)
    private hotelTypeModel: Model<HotelTypeDocument>,
  ) {}

  async allOptions() {
    return await this.hotelTypeModel.find().exec();
  }

  async create(createHotelTypeDto: CreateHotelTypeDto): Promise<HotelType> {
    // Convert Record<string, string> back to Map for Mongoose
    const hotelTypeData = {
      ...createHotelTypeDto,
      name: new Map(Object.entries(createHotelTypeDto.name)),
    };
    const createdHotelType = new this.hotelTypeModel(hotelTypeData);
    return createdHotelType.save();
  }

  async findAll(query: queryType, getHotelTypesDto: GetHotelTypesDto) {
    const extraQueries: any = {};

    return await generalPaginate({
      model: this.hotelTypeModel,
      query,
      searchFields: ['name.tr', 'name.en'], // Adjust fields as necessary
      extraQueries,
    });
  }

  async findOne(id: string): Promise<HotelType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid HotelType ID: ${id}`);
    }
    const hotelType = await this.hotelTypeModel.findById(id).exec();
    if (!hotelType) {
      throw new NotFoundException(`HotelType with ID ${id} not found`);
    }
    return hotelType;
  }

  async update(
    id: string,
    updateHotelTypeDto: UpdateHotelTypeDto,
  ): Promise<HotelType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid HotelType ID: ${id}`);
    }
    // Convert potential Record<string, string> updates back to Map
    const updateData: any = { ...updateHotelTypeDto };
    if (updateHotelTypeDto.name) {
      updateData.name = new Map(Object.entries(updateHotelTypeDto.name));
    }

    const updatedHotelType = await this.hotelTypeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedHotelType) {
      throw new NotFoundException(`HotelType with ID ${id} not found`);
    }
    return updatedHotelType;
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid HotelType ID: ${id}`);
    }
    const result = await this.hotelTypeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`HotelType with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
