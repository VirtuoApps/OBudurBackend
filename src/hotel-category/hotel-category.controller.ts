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
import { HotelCategoryService } from './hotel-category.service';
import { CreateHotelCategoryDto } from './dto/create-hotel-category.dto';
import { UpdateHotelCategoryDto } from './dto/update-hotel-category.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
import { GetHotelCategoriesDto } from './dto/get-hotel-categories.dto';

@Controller('admin/hotel-categories')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class HotelCategoryController {
  constructor(private readonly hotelCategoryService: HotelCategoryService) {}

  @Get('/all-options')
  allOptions() {
    return this.hotelCategoryService.allOptions();
  }

  @Post()
  create(@Body(ValidationPipe) createHotelCategoryDto: CreateHotelCategoryDto) {
    return this.hotelCategoryService.create(createHotelCategoryDto);
  }

  @Put()
  findAll(
    @Query() query: queryType,
    @Body() getHotelCategoriesDto: GetHotelCategoriesDto,
  ) {
    return this.hotelCategoryService.findAll(query, getHotelCategoriesDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHotelCategoryDto: UpdateHotelCategoryDto,
  ) {
    return this.hotelCategoryService.update(id, updateHotelCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelCategoryService.remove(id);
  }
}
