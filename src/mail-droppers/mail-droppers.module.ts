import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailDroppersController } from './mail-droppers.controller';
import { MailDroppersService } from './mail-droppers.service';
import { MailDropper, MailDropperSchema } from './schemas/mail-dropper.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailDropper.name, schema: MailDropperSchema },
    ]),
  ],
  controllers: [MailDroppersController],
  providers: [MailDroppersService],
})
export class MailDroppersModule {}
