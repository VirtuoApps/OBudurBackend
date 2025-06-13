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
} from '@nestjs/common';
import { DistanceTypeService } from './distancetype.service';
import { CreateDistanceTypeDto } from './dto/create-distancetype.dto';
import { UpdateDistanceTypeDto } from './dto/update-distancetype.dto';
import {} from '../common/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
@Controller('admin/distance-types') // Use kebab-case for URL
@UseGuards(AuthGuard('jwt'))
export class DistanceTypeController {
  constructor(private readonly distanceTypeService: DistanceTypeService) {}

  @Get('/all-options')
  allOptions() {
    return this.distanceTypeService.allOptions();
  }

  @Post()
  create(@Body(ValidationPipe) createDto: CreateDistanceTypeDto) {
    return this.distanceTypeService.create(createDto);
  }

  @Get()
  findAll(@Query() query: queryType) {
    return this.distanceTypeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distanceTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateDistanceTypeDto,
  ) {
    return this.distanceTypeService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.distanceTypeService.remove(id);
  }
}
