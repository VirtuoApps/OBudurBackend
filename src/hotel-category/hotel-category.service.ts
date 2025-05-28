import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  HotelCategory,
  HotelCategoryDocument,
} from '../common/schemas/HotelCategory.schema';
import { CreateHotelCategoryDto } from './dto/create-hotel-category.dto';
import { UpdateHotelCategoryDto } from './dto/update-hotel-category.dto';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';
import { GetHotelCategoriesDto } from './dto/get-hotel-categories.dto';
import { HotelType } from 'src/common/schemas/HotelType.schema';

@Injectable()
export class HotelCategoryService {
  constructor(
    @InjectModel(HotelCategory.name)
    private hotelCategoryModel: Model<HotelCategoryDocument>,
    @InjectModel(HotelType.name) private hotelType: Model<HotelType>,
  ) {}

  async allOptions() {
    const hotelCategories = await this.hotelCategoryModel.find().exec();

    const allHotelTypes = await this.hotelType.find();

    const populatedCategories = [];

    hotelCategories.forEach((cat) => {
      const type = allHotelTypes.find(
        (type) => type._id.toString() === cat.hotelTypeId.toString(),
      );

      if (type) {
        populatedCategories.push({
          ...cat.toObject(),
          type,
        });
      }
    });

    return populatedCategories;
  }

  async create(
    createHotelCategoryDto: CreateHotelCategoryDto,
  ): Promise<HotelCategory> {
    // Convert Record<string, string> back to Map for Mongoose
    const hotelCategoryData = {
      ...createHotelCategoryDto,
      name: new Map(Object.entries(createHotelCategoryDto.name)),
    };
    const createdHotelCategory = new this.hotelCategoryModel(hotelCategoryData);
    return createdHotelCategory.save();
  }

  async findAll(
    query: queryType,
    getHotelCategoriesDto: GetHotelCategoriesDto,
  ) {
    const extraQueries: any = {};

    if (getHotelCategoriesDto.hotelTypeId) {
      extraQueries.hotelTypeId = getHotelCategoriesDto.hotelTypeId;
    }

    const paginatedRes = await generalPaginate({
      model: this.hotelCategoryModel,
      query,
      searchFields: ['name.tr', 'name.en'], // Adjust fields as necessary
      extraQueries,
    });

    const allHotelTypes = await this.hotelType.find();

    const populatedResult = [];

    paginatedRes.result.forEach((item) => {
      const type = allHotelTypes.find(
        (type) => type._id.toString() === item.hotelTypeId.toString(),
      );

      populatedResult.push({ ...item.toObject(), name: item.name, type });
    });

    return {
      ...paginatedRes,
      result: populatedResult,
    };
  }

  async findOne(id: string): Promise<HotelCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid HotelCategory ID: ${id}`);
    }
    const hotelCategory = await this.hotelCategoryModel.findById(id).exec();
    if (!hotelCategory) {
      throw new NotFoundException(`HotelCategory with ID ${id} not found`);
    }
    return hotelCategory;
  }

  async update(
    id: string,
    updateHotelCategoryDto: UpdateHotelCategoryDto,
  ): Promise<HotelCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid HotelCategory ID: ${id}`);
    }
    // Convert potential Record<string, string> updates back to Map
    const updateData: any = { ...updateHotelCategoryDto };
    if (updateHotelCategoryDto.name) {
      updateData.name = new Map(Object.entries(updateHotelCategoryDto.name));
    }

    const updatedHotelCategory = await this.hotelCategoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedHotelCategory) {
      throw new NotFoundException(`HotelCategory with ID ${id} not found`);
    }
    return updatedHotelCategory;
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid HotelCategory ID: ${id}`);
    }
    const result = await this.hotelCategoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`HotelCategory with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
