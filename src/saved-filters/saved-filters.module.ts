import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedFiltersController } from './saved-filters.controller';
import { SavedFiltersService } from './saved-filters.service';
import { AuthModule } from 'src/auth/auth.module';
import {
  SavedFilter,
  SavedFilterSchema,
} from 'src/common/schemas/SavedFilter.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: SavedFilter.name, schema: SavedFilterSchema },
    ]),
  ],
  providers: [SavedFiltersService],
  controllers: [SavedFiltersController],
})
export class SavedFiltersModule {}
