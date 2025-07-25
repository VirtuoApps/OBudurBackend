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
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import {} from '../common/guards/admin.guard'; // Import the guard
import { AuthGuard } from '@nestjs/passport';
import { queryType } from 'src/common/utils/general-paginate';
@Controller('admin/languages') // Prefix routes with 'admin/languages'
@UseGuards(AuthGuard('jwt')) // Apply   to all routes in this controller
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  create(@Body(ValidationPipe) createLanguageDto: CreateLanguageDto) {
    return this.languageService.create(createLanguageDto);
  }

  @Get('/all-options')
  allOptions() {
    return this.languageService.allOptions();
  }

  @Get()
  findAll(@Query() query: queryType) {
    return this.languageService.findAll(query);
  }

  // Optional: Endpoint to get the default language
  @Get('default')
  findDefault() {
    return this.languageService.findDefault();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.languageService.update(id, updateLanguageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languageService.remove(id);
  }
}
