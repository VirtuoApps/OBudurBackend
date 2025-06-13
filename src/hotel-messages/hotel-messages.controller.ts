import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { HotelMessagesService } from './hotel-messages.service';
import { CreateInitialMessageDto } from './dto/create-initial-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/common/decorators/user-id.decarator';
import {} from 'src/common/guards/admin.guard';
import { SetMessageSeenDto } from './dto/set-message-seen.dto';

@Controller('hotel-messages')
export class HotelMessagesController {
  constructor(private readonly hotelMessagesService: HotelMessagesService) {}

  @Get('/:hotelId')
  @UseGuards(AuthGuard('jwt'))
  getMessagesOfHotel(@Param('hotelId') hotelId: string) {
    return this.hotelMessagesService.getMessagesOfHotel(hotelId);
  }

  @Patch('/:messageId')
  @UseGuards(AuthGuard('jwt'))
  setMessageSeen(
    @Param('messageId') messageId: string,
    @Body() setMessageSeenDto: SetMessageSeenDto,
  ) {
    return this.hotelMessagesService.setMessageSeen(
      messageId,
      setMessageSeenDto,
    );
  }

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
