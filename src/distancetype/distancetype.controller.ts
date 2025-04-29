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
} from '@nestjs/common';
import { DistanceTypeService } from './distancetype.service';
import { CreateDistanceTypeDto } from './dto/create-distancetype.dto';
import { UpdateDistanceTypeDto } from './dto/update-distancetype.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin/distance-types') // Use kebab-case for URL
@UseGuards(AdminGuard)
export class DistanceTypeController {
  constructor(private readonly distanceTypeService: DistanceTypeService) {}

  @Post()
  create(@Body(ValidationPipe) createDto: CreateDistanceTypeDto) {
    return this.distanceTypeService.create(createDto);
  }

  @Get()
  findAll() {
    return this.distanceTypeService.findAll();
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
