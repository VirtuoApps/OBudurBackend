import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DistanceType,
  DistanceTypeDocument,
} from '../common/schemas/DistanceType.schema';
import { CreateDistanceTypeDto } from './dto/create-distancetype.dto';
import { UpdateDistanceTypeDto } from './dto/update-distancetype.dto';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';

@Injectable()
export class DistanceTypeService {
  constructor(
    @InjectModel(DistanceType.name)
    private distanceTypeModel: Model<DistanceTypeDocument>,
  ) {}

  async create(createDto: CreateDistanceTypeDto): Promise<DistanceType> {
    const created = new this.distanceTypeModel(createDto);
    return created.save();
  }

  async findAll(query: queryType) {
    return await generalPaginate({
      model: this.distanceTypeModel,
      query,
      searchFields: ['name.tr', 'name.en'], // Adjust fields as necessary
      extraQueries: {},
    });
  }

  async findOne(id: string): Promise<DistanceType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid DistanceType ID: ${id}`);
    }
    const item = await this.distanceTypeModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`DistanceType with ID ${id} not found`);
    }
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateDistanceTypeDto,
  ): Promise<DistanceType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid DistanceType ID: ${id}`);
    }
    const updated = await this.distanceTypeModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`DistanceType with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid DistanceType ID: ${id}`);
    }
    // TODO: Add check if this DistanceType is used in any Hotel before deleting?
    const result = await this.distanceTypeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`DistanceType with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
