import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DistanceTypeModule } from './distancetype/distancetype.module';
import { FavoritesModule } from './favorites/favorites.module';
import { FeatureModule } from './feature/feature.module';
import { FileSystemModule } from './file-system/file-system.module';
import { HotelCategoryModule } from './hotel-category/hotel-category.module';
import { HotelMessagesModule } from './hotel-messages/hotel-messages.module';
import { HotelModule } from './hotel/hotel.module';
import { HotelTypesModule } from './hotel-types/hotel-types.module';
import { LanguageModule } from './language/language.module';
import { MailDroppersModule } from './mail-droppers/mail-droppers.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Module } from './s3/s3.module';
import { SavedFiltersModule } from './saved-filters/saved-filters.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    LanguageModule,
    FeatureModule,
    DistanceTypeModule,
    HotelModule,
    HotelCategoryModule,
    HotelTypesModule,
    S3Module,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_DEV),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT) || 2525,
        secure: false, // Mailtrap uses TLS, not SSL
        // auth: {
        //   user: process.env.MAIL_USER,
        //   pass: process.env.MAIL_PASS,
        // },
      },
      defaults: {
        from: process.env.MAIL_FROM,
      },
    }),
    FileSystemModule,
    UsersModule,
    HotelMessagesModule,
    FavoritesModule,
    MailDroppersModule,
    SavedFiltersModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
