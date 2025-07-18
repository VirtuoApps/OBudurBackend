import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feature, FeatureDocument } from '../common/schemas/Feature.schema';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';
import { GetFeaturesDto } from './dto/get-features.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature.name) private featureModel: Model<FeatureDocument>,
  ) {}

  async getAllGeneralFeatures() {
    return await this.featureModel.find({ featureType: 'general' }).exec();
  }

  async allOptions() {
    return await this.featureModel.find().exec();
  }

  async allQuickFilters() {
    return await this.featureModel
      .find({ isQuickFilter: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    // Convert Record<string, string> back to Map for Mongoose
    const featureData = {
      ...createFeatureDto,
      name: new Map(Object.entries(createFeatureDto.name)),
    };
    const createdFeature = new this.featureModel(featureData);
    return createdFeature.save();
  }

  async findAll(query: queryType, getFeaturesDto: GetFeaturesDto) {
    const { featureType, housingType } = getFeaturesDto;

    const extraQueries: any = {};

    if (featureType) {
      extraQueries.featureType = featureType;
    }

    if (housingType) {
      extraQueries.housingType = housingType;
    }

    return await generalPaginate({
      model: this.featureModel,
      query,
      searchFields: ['name.tr', 'name.en'], // Adjust fields as necessary
      extraQueries,
    });
  }

  async findAllQuickFilters(query: queryType, getFeaturesDto: GetFeaturesDto) {
    const { featureType } = getFeaturesDto;

    const extraQueries: any = {
      isQuickFilter: true,
    };

    if (featureType) {
      extraQueries.featureType = featureType;
    }

    // Add default sorting by order field for quick filters
    const sortQuery = query.sort || { order: 1, createdAt: 1 };

    return await generalPaginate({
      model: this.featureModel,
      query: { ...query, sort: sortQuery },
      searchFields: ['name.tr', 'name.en'], // Adjust fields as necessary
      extraQueries,
    });
  }

  async findOne(id: string): Promise<Feature> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Feature ID: ${id}`);
    }
    const feature = await this.featureModel.findById(id).exec();
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return feature;
  }

  async update(
    id: string,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<Feature> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Feature ID: ${id}`);
    }
    // Convert potential Record<string, string> updates back to Map
    const updateData: any = { ...updateFeatureDto };
    if (updateFeatureDto.name) {
      updateData.name = new Map(Object.entries(updateFeatureDto.name));
    }

    const updatedFeature = await this.featureModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedFeature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return updatedFeature;
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Feature ID: ${id}`);
    }
    const result = await this.featureModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return { deleted: true };
  }

  async getAllForOldAndDisabledFeatures() {
    return await this.featureModel
      .find({ featureType: 'for-olds-and-disabled' })
      .exec();
  }

  async getAllFaceFeatures() {
    return await this.featureModel.find({ featureType: 'face' }).exec();
  }
}
