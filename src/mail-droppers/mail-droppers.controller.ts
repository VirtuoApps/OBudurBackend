import { Body, Controller, Post, Query, ValidationPipe } from '@nestjs/common';
import { MailDroppersService } from './mail-droppers.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('mail-droppers')
export class MailDroppersController {
  constructor(private readonly mailDroppersService: MailDroppersService) {}

  @Post('subscribe')
  async subscribe(@Body(ValidationPipe) subscribeDto: SubscribeDto) {
    return this.mailDroppersService.subscribe(subscribeDto);
  }

  @Post('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    return this.mailDroppersService.unsubscribe(email);
  }
}
