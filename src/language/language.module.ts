import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Language, LanguageSchema } from '../common/schemas/Language.schema';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Language.name, schema: LanguageSchema },
    ]),
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class LanguageModule {}
