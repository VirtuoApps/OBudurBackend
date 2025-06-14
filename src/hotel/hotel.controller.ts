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
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
import { UserId } from 'src/common/decorators/user-id.decarator';
import { GetHotelsDto } from './dto/get-hotels.dto';
@Controller('admin/hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/fix-faces')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  fixFaces() {
    return this.hotelService.fixFaces();
  }

  @Post('/dummy-data')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  dummyData() {
    return this.hotelService.dummyData();
  }

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  getMineHotels(@UserId() userId: string) {
    return this.hotelService.getMineHotels(userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  create(
    @Body(ValidationPipe) createHotelDto: CreateHotelDto,
    @UserId() userId: string,
  ) {
    // Enable forbidNonWhitelisted in ValidationPipe later if needed
    return this.hotelService.create(createHotelDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  findAll(@Query() queryParams: queryType) {
    // Placeholder for query params
    // Add filtering/pagination based on queryParams later
    return this.hotelService.findAll(queryParams, {});
  }

  @Post('/confirm-hotel/:hotelId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  confirmHotel(@Param('hotelId') hotelId: string) {
    return this.hotelService.confirmHotel(hotelId);
  }

  @Post('/disable-confirm-hotel/:hotelId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  disableConfirmHotel(@Param('hotelId') hotelId: string) {
    return this.hotelService.disableConfirmHotel(hotelId);
  }

  @Put('/not-published')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
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
  @UseGuards(AuthGuard('jwt'), AdminGuard)
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
  @UseGuards(AuthGuard('jwt'), AdminGuard)
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
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateHotelDto: UpdateHotelDto,
  ) {
    return this.hotelService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }
}
