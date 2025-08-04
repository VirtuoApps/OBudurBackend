// eids.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Agent } from 'https';

import { EidsController } from './eids.controller';
import { EidsService } from './eids.service';
import { User, UserSchema } from '../common/schemas/Users.schema';

@Module({
  imports: [
    // User modelini bu modülde kullanıma kayıt et
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // HTTP modülünü konfigüre et (gerekirse SSL doğrulamasını kapat)
    HttpModule.register({
      // timeout, baseURL gibi ayarlar da eklenebilir
      httpsAgent: new Agent({ rejectUnauthorized: false })  // SSL sertifikasını doğrulama
    })
  ],
  controllers: [EidsController],
  providers: [EidsService]
})
export class EidsModule {}
