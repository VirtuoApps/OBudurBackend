import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file-system')
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() file: any) {
    return this.fileSystemService.uploadImage(file);
  }

  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any) {
    return this.fileSystemService.uploadFile(file);
  }
}
