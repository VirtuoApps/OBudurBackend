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
import { S3Module } from './s3/s3.module';
import { UsersModule } from './users/users.module';
import { HotelMessagesModule } from './hotel-messages/hotel-messages.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MailDroppersModule } from './mail-droppers/mail-droppers.module';
import { HotelCategoryModule } from './hotel-category/hotel-category.module';
import { HotelTypesModule } from './hotel-types/hotel-types.module';
import { SavedFiltersModule } from './saved-filters/saved-filters.module';
import { EidsModule } from './eids/eids.module';

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
    UsersModule,
    HotelMessagesModule,
    FavoritesModule,
    MailDroppersModule,
    SavedFiltersModule,
    EidsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
