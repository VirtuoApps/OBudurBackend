import { Injectable } from '@nestjs/common';

import { S3 } from 'aws-sdk';

const s3 = new S3({
  endpoint: `https://5f39e626343dc1549f9f44d330f0d249.r2.cloudflarestorage.com/moniapp`,
  accessKeyId: 'cff0a3e32245e76eed296f3d56bd8d67',
  secretAccessKey:
    'a3f19089646df1ef266675ee0fab0eb1b90c8e7c3ba9ddc172137574c3be814d',
  // region: process.env.AWS_REGION,
  signatureVersion: 'v4',
  region: 'auto',
});

@Injectable()
export class CloudflareR2Service {
  uploadFileToS3 = async (buffer: any, fileName: string) => {
    const mime = require('mime-types'); // Make sure to install mime-types package
    const contentType = mime.lookup(fileName) || 'application/octet-stream';

    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: 'inline',
    };

    try {
      const response = await s3.upload(params).promise();

      console.log({
        location: response.Location,
      });

      return {
        status: 'success',
        location: response.Location.replace(
          'moniapp.5f39e626343dc1549f9f44d330f0d249.r2.cloudflarestorage.com',
          'moniapp.cc',
        )
          .replace(
            '5f39e626343dc1549f9f44d330f0d249.r2.cloudflarestorage.com',
            'moniapp.cc',
          )
          .replace('/neo-skola', ''),
      };
    } catch (err) {
      console.error(err);
      return {
        status: 'failed',
      };
    }
  };
}
