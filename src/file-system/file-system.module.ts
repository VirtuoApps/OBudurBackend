import { Module } from '@nestjs/common';
import { FileSystemController } from './file-system.controller';
import { S3Module } from 'src/s3/s3.module';
import { FileSystemService } from './file-system.service';

@Module({
  imports: [S3Module],
  providers: [FileSystemService],
  controllers: [FileSystemController],
})
export class FileSystemModule {}
