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
  Put, // For potential filtering/pagination later
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import {} from '../common/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
import { UserId } from 'src/common/decorators/user-id.decarator';
import { GetHotelsDto } from './dto/get-hotels.dto';
@Controller('admin/hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/fix-faces')
  @UseGuards(AuthGuard('jwt'))
  fixFaces() {
    return this.hotelService.fixFaces();
  }

  @Post('/dummy-data')
  @UseGuards(AuthGuard('jwt'))
  dummyData() {
    return this.hotelService.dummyData();
  }

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'))
  getMineHotels(@UserId() userId: string) {
    return this.hotelService.getMineHotels(userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body(ValidationPipe) createHotelDto: CreateHotelDto,
    @UserId() userId: string,
  ) {
    // Enable forbidNonWhitelisted in ValidationPipe later if needed
    return this.hotelService.create(createHotelDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Query() queryParams: queryType) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll(queryParams, {});
  }

  @Post('/confirm-hotel/:hotelId')
  @UseGuards(AuthGuard('jwt'))
  confirmHotel(@Param('hotelId') hotelId: string) {
    return this.hotelService.confirmHotel(hotelId);
  }

  @Post('/disable-confirm-hotel/:hotelId')
  @UseGuards(AuthGuard('jwt'))
  disableConfirmHotel(@Param('hotelId') hotelId: string) {
    return this.hotelService.disableConfirmHotel(hotelId);
  }

  @Put('/not-published')
  @UseGuards(AuthGuard('jwt'))
  findAllNotPublished(
    @Query() queryParams: queryType,
    @Body() getHotelsDto: GetHotelsDto,
  ) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll(
      queryParams,
      {
        isPublished: false,
      },
      getHotelsDto,
    );
  }

  @Put('/not-confirmed')
  @UseGuards(AuthGuard('jwt'))
  findAllNotConfirmed(
    @Query() queryParams: queryType,
    @Body() getHotelsDto: GetHotelsDto,
  ) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll(
      queryParams,
      {
        isConfirmedByAdmin: false,
      },
      getHotelsDto,
    );
  }

  @Put('/confirmed')
  @UseGuards(AuthGuard('jwt'))
  findAllConfirmed(
    @Query() queryParams: queryType,
    @Body() getHotelsDto: GetHotelsDto,
  ) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll(
      queryParams,
      {
        isConfirmedByAdmin: true,
      },
      getHotelsDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHotelDto: UpdateHotelDto,
  ) {
    return this.hotelService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }
}
