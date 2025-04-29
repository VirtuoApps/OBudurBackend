import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LanguageModule } from './modules/language/language.module';
import { FeatureModule } from './modules/feature/feature.module';
import { DistanceTypeModule } from './modules/distancetype/distancetype.module';
import { HotelModule } from './modules/hotel/hotel.module';

@Module({
  imports: [
    AuthModule,
    LanguageModule,
    FeatureModule,
    DistanceTypeModule,
    HotelModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
