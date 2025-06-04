import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SavedFilter,
  SavedFilterDocument,
} from '../common/schemas/SavedFilter.schema';
import { CreateSavedFilterDto } from './dto/create-saved-filter.dto';
import { UpdateSavedFilterDto } from './dto/update-saved-filter.dto';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';

@Injectable()
export class SavedFiltersService {
  constructor(
    @InjectModel(SavedFilter.name)
    private savedFilterModel: Model<SavedFilterDocument>,
  ) {}

  async create(
    createSavedFilterDto: CreateSavedFilterDto,
    userId: string,
  ): Promise<SavedFilter> {
    const filterData = {
      ...createSavedFilterDto,
      userId,
    };

    const createdFilter = new this.savedFilterModel(filterData);
    return createdFilter.save();
  }

  async findAll(query: queryType): Promise<any> {
    return await generalPaginate({
      model: this.savedFilterModel,
      query,
      searchFields: ['filterName'],
      extraQueries: {},
    });
  }

  async findAllByUser(userId: string): Promise<any> {
    const mineSavedFilters = await this.savedFilterModel
      .find({ userId })
      .exec();

    return mineSavedFilters;
  }

  async findOne(id: string): Promise<SavedFilter> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid SavedFilter ID: ${id}`);
    }
    const savedFilter = await this.savedFilterModel.findById(id).exec();
    if (!savedFilter) {
      throw new NotFoundException(`SavedFilter with ID ${id} not found`);
    }
    return savedFilter;
  }

  async findOneByUser(id: string, userId: string): Promise<SavedFilter> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid SavedFilter ID: ${id}`);
    }
    const savedFilter = await this.savedFilterModel
      .findOne({ _id: id, userId })
      .exec();
    if (!savedFilter) {
      throw new NotFoundException(
        `SavedFilter with ID ${id} not found for this user`,
      );
    }
    return savedFilter;
  }

  async update(
    id: string,
    updateSavedFilterDto: UpdateSavedFilterDto,
    userId: string,
  ): Promise<SavedFilter> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid SavedFilter ID: ${id}`);
    }

    const updatedFilter = await this.savedFilterModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: updateSavedFilterDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedFilter) {
      throw new NotFoundException(
        `SavedFilter with ID ${id} not found for this user`,
      );
    }

    return updatedFilter;
  }

  async remove(id: string, userId: string): Promise<SavedFilter> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid SavedFilter ID: ${id}`);
    }

    const deletedFilter = await this.savedFilterModel
      .findOneAndDelete({ _id: id, userId: userId.toString() })
      .exec();

    return deletedFilter;
  }

  async toggleNotifications(
    id: string,
    userId: string,
    enableNotifications: boolean,
  ): Promise<SavedFilter> {
    return this.update(id, { enableNotifications }, userId);
  }

  async toggleMailNotifications(
    id: string,
    userId: string,
    enableMailNotifications: boolean,
  ): Promise<SavedFilter> {
    return this.update(id, { enableMailNotifications }, userId);
  }

  async getUserFiltersWithNotifications(
    userId: string,
  ): Promise<SavedFilter[]> {
    return this.savedFilterModel
      .find({
        userId,
        $or: [{ enableNotifications: true }, { enableMailNotifications: true }],
      })
      .exec();
  }
}
