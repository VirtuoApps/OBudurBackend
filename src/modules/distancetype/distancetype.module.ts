import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DistanceType,
  DistanceTypeSchema,
} from '../../common/schemas/DistanceType.schema';
import { DistanceTypeController } from './distancetype.controller';
import { DistanceTypeService } from './distancetype.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DistanceType.name, schema: DistanceTypeSchema },
    ]),
  ],
  controllers: [DistanceTypeController],
  providers: [DistanceTypeService],
})
export class DistanceTypeModule {}
