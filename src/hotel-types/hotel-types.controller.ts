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
import { HotelTypesService } from './hotel-types.service';
import { CreateHotelTypeDto } from './dto/create-hotel-type.dto';
import { UpdateHotelTypeDto } from './dto/update-hotel-type.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
import { GetHotelTypesDto } from './dto/get-hotel-types.dto';

@Controller('admin/hotel-types')
export class HotelTypesController {
  constructor(private readonly hotelTypesService: HotelTypesService) {}

  @Get('/all-options')
  allOptions() {
    return this.hotelTypesService.allOptions();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  create(@Body(ValidationPipe) createHotelTypeDto: CreateHotelTypeDto) {
    return this.hotelTypesService.create(createHotelTypeDto);
  }

  @Put()
  findAll(
    @Query() query: queryType,
    @Body() getHotelTypesDto: GetHotelTypesDto,
  ) {
    return this.hotelTypesService.findAll(query, getHotelTypesDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHotelTypeDto: UpdateHotelTypeDto,
  ) {
    return this.hotelTypesService.update(id, updateHotelTypeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  remove(@Param('id') id: string) {
    return this.hotelTypesService.remove(id);
  }
}
