import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { FilterHotelDto } from './dto/filter-hotel.dto';

@Controller('hotels')
export class HotelUserController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('/:slug')
  getHotelBySlug(@Param('slug') slug: string) {
    return this.hotelService.getHotelBySlug(slug);
  }

  @Get('/filter-options')
  getFilterOptions() {
    return this.hotelService.getFilterOptions();
  }

  @Get()
  async findAll(@Query() filterDto: FilterHotelDto) {
    return this.hotelService.filterHotels(filterDto);
  }
}
