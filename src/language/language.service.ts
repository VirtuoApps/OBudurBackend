import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Language, LanguageDocument } from '../common/schemas/Language.schema';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import generalPaginate, { queryType } from 'src/common/utils/general-paginate';

@Injectable()
export class LanguageService {
  constructor(
    @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const createdLanguage = new this.languageModel(createLanguageDto);
    // Handle potential isDefault=true setting - ensure only one default
    if (createLanguageDto.isDefault) {
      await this.languageModel.updateMany(
        { isDefault: true },
        { isDefault: false },
      );
    }
    return createdLanguage.save();
  }

  async findAll(query: queryType) {
    return await generalPaginate({
      model: this.languageModel,
      query,
      searchFields: ['name', 'nativeName'], // Adjust fields as necessary
      extraQueries: {},
    });
  }

  async findOne(id: string): Promise<Language> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Language ID: ${id}`);
    }
    const language = await this.languageModel.findById(id).exec();
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return language;
  }

  async update(
    id: string,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Language ID: ${id}`);
    }
    // Handle potential isDefault=true setting - ensure only one default
    if (updateLanguageDto.isDefault) {
      await this.languageModel.updateMany(
        { _id: { $ne: id }, isDefault: true },
        { isDefault: false },
      );
    } else {
      // If setting isDefault to false, ensure there's at least one default left
      const current = await this.languageModel.findById(id);
      if (current?.isDefault) {
        const defaultCount = await this.languageModel.countDocuments({
          isDefault: true,
          _id: { $ne: id },
        });
        if (defaultCount === 0) {
          throw new Error('Cannot unset the only default language.'); // Or handle differently
        }
      }
    }

    const updatedLanguage = await this.languageModel
      .findByIdAndUpdate(id, updateLanguageDto, { new: true })
      .exec();
    if (!updatedLanguage) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return updatedLanguage;
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid Language ID: ${id}`);
    }
    // Prevent deleting the default language
    const language = await this.languageModel.findById(id);
    if (language?.isDefault) {
      throw new Error('Cannot delete the default language.'); // Consider a BadRequestException
    }

    const result = await this.languageModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return { deleted: true };
  }

  // Optional: Helper to find the default language
  async findDefault(): Promise<Language | null> {
    return this.languageModel.findOne({ isDefault: true }).exec();
  }
}
