import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feature, FeatureDocument } from '../../common/schemas/Feature.schema';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature.name) private featureModel: Model<FeatureDocument>,
  ) {}

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    // Convert Record<string, string> back to Map for Mongoose
    const featureData = {
      ...createFeatureDto,
      name: new Map(Object.entries(createFeatureDto.name)),
      labels: createFeatureDto.labels
        ? new Map(Object.entries(createFeatureDto.labels))
        : undefined,
    };
    const createdFeature = new this.featureModel(featureData);
    return createdFeature.save();
  }

  async findAll(): Promise<Feature[]> {
    return this.featureModel.find().exec();
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
    if (updateFeatureDto.labels) {
      updateData.labels = new Map(Object.entries(updateFeatureDto.labels));
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
}
