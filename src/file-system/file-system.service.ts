import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudflareR2Service } from 'src/cloudflare-r2/cloudflare-r2.service';
import errorCodes from 'src/common/errorCodes/errorCodes';
import * as heicConvert from 'heic-convert';

@Injectable()
export class FileSystemService {
  constructor(private readonly cloudflareR2Service: CloudflareR2Service) {}

  async uploadImage(file: any) {
    if (!file) {
      throw new NotFoundException({
        errorCode: errorCodes.FILE_NOT_FOUND,
        message: 'Dosya bulunamadı',
        statusCode: 404,
      });
    }

    const now = new Date();
    let fileBuffer = file.buffer;
    let fileExtension = file.originalname.split('.').pop().toLowerCase();

    // Convert HEIC/HEIF to JPG
    if (fileExtension === 'heic' || fileExtension === 'heif') {
      fileBuffer = await heicConvert({
        buffer: file.buffer,
        format: 'JPEG',
        quality: 0.9,
      });
      fileExtension = 'jpg';
    }

    const fileRes = await this.cloudflareR2Service.uploadFileToS3(
      fileBuffer,
      `images/${now.getTime()}.${fileExtension}`,
    );

    return {
      location: fileRes.location,
    };
  }

  async uploadFile(file: any) {
    if (!file) {
      throw new NotFoundException({
        errorCode: errorCodes.FILE_NOT_FOUND,
        message: 'Dosya bulunamadı',
        statusCode: 404,
      });
    }

    const now = new Date();

    const fileRes = await this.cloudflareR2Service.uploadFileToS3(
      file.buffer,
      `files/${now.getTime()}.${file.originalname.split('.').pop()}`,
    );

    return {
      location: fileRes.location,
    };
  }
}
