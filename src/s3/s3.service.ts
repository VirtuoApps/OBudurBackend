import * as mime from 'mime-types';

import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  uploadFileToS3 = async (buffer: any, fileName: string) => {
    const contentType = mime.lookup(fileName) ?? 'application/octet-stream';

    const fileKey = Date.now().toString();

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=600', // Cache for 10 minutes
    };

    try {
      const response = await this.s3.upload(params).promise();

      console.log({
        location: response.Location,
      });

      return {
        status: 'success',
        location: response.Location, // Use actual S3 response location
      };
    } catch (err) {
      console.error(err);
      return {
        status: 'failed',
      };
    }
  };
}
