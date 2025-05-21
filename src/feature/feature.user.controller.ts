import { Controller, Get } from '@nestjs/common';
import { FeatureService } from './feature.service';

@Controller('features')
export class FeatureUserController {
  constructor(private readonly featureService: FeatureService) {}

  @Get('/general')
  getAllGeneralFeatures() {
    return this.featureService.getAllGeneralFeatures();
  }

  @Get('/all-options')
  getAllOptions() {
    return this.featureService.allOptions();
  }
}
