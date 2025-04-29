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
  Query, // For potential filtering/pagination later
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin/hotels')
@UseGuards(AdminGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  create(@Body(ValidationPipe) createHotelDto: CreateHotelDto) {
    // Enable forbidNonWhitelisted in ValidationPipe later if needed
    return this.hotelService.create(createHotelDto);
  }

  @Get()
  findAll(/* @Query() queryParams: any */) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHotelDto: UpdateHotelDto,
  ) {
    return this.hotelService.update(id, updateHotelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }
}
