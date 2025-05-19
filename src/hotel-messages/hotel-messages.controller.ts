import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { HotelMessagesService } from './hotel-messages.service';
import { CreateInitialMessageDto } from './dto/create-initial-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/common/decorators/user-id.decarator';

@Controller('hotel-messages')
export class HotelMessagesController {
  constructor(private readonly hotelMessagesService: HotelMessagesService) {}

  @Post('initial')
  @UseGuards(AuthGuard('jwt'))
  createInitialMessage(
    @Body() createInitialMessageDto: CreateInitialMessageDto,
    @UserId() userId: string,
  ) {
    return this.hotelMessagesService.createInitialMessage(
      createInitialMessageDto,
      userId,
    );
  }

  @Get('/hotels/:hotelId')
  @UseGuards(AuthGuard('jwt'))
  getExistsMessageOfHotel(
    @Param('hotelId') hotelId: string,
    @UserId() userId: string,
  ) {
    return this.hotelMessagesService.getExistsMessageOfHotel(hotelId, userId);
  }
}
