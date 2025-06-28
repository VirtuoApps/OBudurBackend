import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query,
  UsePipes,
} from '@nestjs/common';
import { SavedFiltersService } from './saved-filters.service';
import { CreateSavedFilterDto } from './dto/create-saved-filter.dto';
import { UpdateSavedFilterDto } from './dto/update-saved-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/common/decorators/user-id.decarator';
import { queryType } from 'src/common/utils/general-paginate';

@Controller('saved-filters')
@UseGuards(AuthGuard('jwt'))
export class SavedFiltersController {
  constructor(private readonly savedFiltersService: SavedFiltersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(
    @Body() createSavedFilterDto: CreateSavedFilterDto,
    @UserId() userId: string,
  ) {
    return this.savedFiltersService.create(createSavedFilterDto, userId);
  }

  @Get('/mine-for-mobile')
  findMineForMobile(@UserId() userId: string) {
    return this.savedFiltersService.findAllByUserForMobile(userId);
  }

  @Get('/mine')
  findMine(@UserId() userId: string) {
    return this.savedFiltersService.findAllByUser(userId);
  }

  @Get('/mine/:id')
  findOne(@Param('id') id: string, @UserId() userId: string) {
    return this.savedFiltersService.findOneByUser(id, userId);
  }

  @Patch('/mine/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('id') id: string,
    @Body() updateSavedFilterDto: UpdateSavedFilterDto,
    @UserId() userId: string,
  ) {
    return this.savedFiltersService.update(id, updateSavedFilterDto, userId);
  }

  @Delete('/mine/:id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.savedFiltersService.remove(id, userId);
  }

  @Patch('/mine/:id/toggle-notifications')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  toggleNotifications(
    @Param('id') id: string,
    @Body('enableNotifications') enableNotifications: boolean,
    @UserId() userId: string,
  ) {
    return this.savedFiltersService.toggleNotifications(
      id,
      userId,
      enableNotifications,
    );
  }

  @Patch('/mine/:id/toggle-mail-notifications')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  toggleMailNotifications(
    @Param('id') id: string,
    @Body('enableMailNotifications') enableMailNotifications: boolean,
    @UserId() userId: string,
  ) {
    return this.savedFiltersService.toggleMailNotifications(
      id,
      userId,
      enableMailNotifications,
    );
  }

  @Get('/mine/with-notifications')
  getFiltersWithNotifications(@UserId() userId: string) {
    return this.savedFiltersService.getUserFiltersWithNotifications(userId);
  }
}
