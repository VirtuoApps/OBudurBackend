import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { FilterHotelDto } from './dto/filter-hotel.dto';

@Controller('hotels')
export class HotelUserController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/:hotelId/increase-view-count')
  increaseViewCount(@Param('hotelId') hotelId: string) {
    return this.hotelService.increaseViewCount(hotelId);
  }

  @Get('/filter-options')
  getFilterOptions() {
    return this.hotelService.getFilterOptions();
  }

  @Get('/:slug')
  getHotelBySlug(@Param('slug') slug: string) {
    return this.hotelService.getHotelBySlug(slug);
  }

  @Get()
  async findAll(@Query() filterDto: FilterHotelDto) {
    return this.hotelService.filterHotels(filterDto);
  }
}
