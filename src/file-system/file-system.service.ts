import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import errorCodes from 'src/common/errorCodes/errorCodes';
import * as heicConvert from 'heic-convert';

@Injectable()
export class FileSystemService {
  constructor(private readonly s3Service: S3Service) {}

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

    const fileRes = await this.s3Service.uploadFileToS3(
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

    const fileRes = await this.s3Service.uploadFileToS3(
      file.buffer,
      `files/${now.getTime()}.${file.originalname.split('.').pop()}`,
    );

    return {
      location: fileRes.location,
    };
  }
}
