import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LanguageModule } from './language/language.module';
import { FeatureModule } from './feature/feature.module';
import { DistanceTypeModule } from './distancetype/distancetype.module';
import { HotelModule } from './hotel/hotel.module';
import { FileSystemModule } from './file-system/file-system.module';
import { CloudflareR2Module } from './cloudflare-r2/cloudflare-r2.module';

@Module({
  imports: [
    AuthModule,
    LanguageModule,
    FeatureModule,
    DistanceTypeModule,
    HotelModule,
    CloudflareR2Module,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_DEV),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
    }),
    FileSystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
