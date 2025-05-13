import { Controller, Get, Query } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { FilterHotelDto } from './dto/filter-hotel.dto';

@Controller('hotels')
export class HotelUserController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  async findAll(@Query() filterDto: FilterHotelDto) {
    return this.hotelService.filterHotels(filterDto);
  }
}
