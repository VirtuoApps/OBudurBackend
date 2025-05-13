import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Feature, FeatureSchema } from '../common/schemas/Feature.schema';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { AuthModule } from 'src/auth/auth.module';
import { FeatureUserController } from './feature.user.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Feature.name, schema: FeatureSchema }]),
  ],
  controllers: [FeatureController, FeatureUserController],
  providers: [FeatureService],
})
export class FeatureModule {}
