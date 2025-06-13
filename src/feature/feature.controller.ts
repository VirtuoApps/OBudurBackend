import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query,
  Put,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import {} from '../common/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
import { GetFeaturesDto } from './dto/get-features.dto';

@Controller('admin/features')
@UseGuards(AuthGuard('jwt'))
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get('/all-options')
  allOptions() {
    return this.featureService.allOptions();
  }

  @Post()
  create(@Body(ValidationPipe) createFeatureDto: CreateFeatureDto) {
    return this.featureService.create(createFeatureDto);
  }

  @Put()
  findAll(@Query() query: queryType, @Body() getFeaturesDto: GetFeaturesDto) {
    return this.featureService.findAll(query, getFeaturesDto);
  }

  @Put('/quick-filters')
  findAllQuickFilters(
    @Query() query: queryType,
    @Body() getFeaturesDto: GetFeaturesDto,
  ) {
    return this.featureService.findAllQuickFilters(query, getFeaturesDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateFeatureDto: UpdateFeatureDto,
  ) {
    return this.featureService.update(id, updateFeatureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.featureService.remove(id);
  }
}
