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
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
import { UserId } from 'src/common/decorators/user-id.decarator';
@Controller('admin/hotels')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/dummy-data')
  dummyData() {
    return this.hotelService.dummyData();
  }

  @Post()
  create(
    @Body(ValidationPipe) createHotelDto: CreateHotelDto,
    @UserId() userId: string,
  ) {
    // Enable forbidNonWhitelisted in ValidationPipe later if needed
    return this.hotelService.create(createHotelDto, userId);
  }

  @Get()
  findAll(@Query() queryParams: queryType) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll(queryParams);
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
