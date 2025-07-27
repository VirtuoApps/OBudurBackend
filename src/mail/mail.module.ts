import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailTestController } from './mail-test.controller';
import { MailTestService } from './mail-test.service';

@Module({
  imports: [ConfigModule],
  controllers: [MailController, MailTestController],
  providers: [MailService, MailTestService],
  exports: [MailService],
})
export class MailModule {}
