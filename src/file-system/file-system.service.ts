import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudflareR2Service } from 'src/cloudflare-r2/cloudflare-r2.service';
import errorCodes from 'src/common/errorCodes/errorCodes';

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

    const fileRes = await this.cloudflareR2Service.uploadFileToS3(
      file.buffer,
      `images/${now.getTime()}.${file.originalname.split('.').pop()}`,
    );

    return {
      location: fileRes.location,
    };
  }
}
