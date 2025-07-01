import { Injectable } from '@nestjs/common';

import { S3 } from 'aws-sdk';

const s3 = new S3({
  region: 'auto',
  endpoint: `https://8e234426b68cc4b0beb6145043c62fff.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: `32f3861704ce8e7ee962217584dfbddf`,
    secretAccessKey: `53c393bf584c4579d9557b879442f89be3a3d1c90c2821f07f8a8625fbe1ec47`,
  },
});

@Injectable()
export class CloudflareR2Service {
  uploadFileToS3 = async (buffer: any, fileName: string) => {
    const mime = require('mime-types'); // Make sure to install mime-types package
    const contentType = mime.lookup(fileName) || 'application/octet-stream';

    let fileKey = Date.now().toString();

    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
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
        location: `https://video.neoskola.net/${fileKey}`,
      };
    } catch (err) {
      console.error(err);
      return {
        status: 'failed',
      };
    }
  };
}
