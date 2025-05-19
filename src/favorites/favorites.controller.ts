import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from 'src/common/decorators/user-id.decarator';
import { FavoriteDocument } from 'src/common/schemas/Favorite.schema';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('hotels/:hotelId')
  @UseGuards(AuthGuard('jwt'))
  async addFavorite(
    @UserId() userId: string,
    @Param('hotelId') hotelId: string,
  ): Promise<FavoriteDocument> {
    return this.favoritesService.addFavorite(userId, hotelId);
  }

  @Delete('hotels/:hotelId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @UserId() userId: string,
    @Param('hotelId') hotelId: string,
  ): Promise<void> {
    return this.favoritesService.removeFavorite(userId, hotelId);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyFavorites(@UserId() userId: string): Promise<FavoriteDocument[]> {
    return this.favoritesService.getUserFavorites(userId);
  }
}
