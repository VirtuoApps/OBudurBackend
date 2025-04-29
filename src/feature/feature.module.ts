import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Feature, FeatureSchema } from '../common/schemas/Feature.schema';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feature.name, schema: FeatureSchema }]),
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
