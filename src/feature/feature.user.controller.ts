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

  @Get('/all-quick-filters')
  allQuickFilters() {
    return this.featureService.allQuickFilters();
  }

  @Get('/for-olds-and-disabled')
  getAllForOldAndDisabledFeatures() {
    return this.featureService.getAllForOldAndDisabledFeatures();
  }

  @Get('/face')
  getAllFaceFeatures() {
    return this.featureService.getAllFaceFeatures();
  }
}
