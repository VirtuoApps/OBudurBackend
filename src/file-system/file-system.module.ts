import { Module } from '@nestjs/common';
import { FileSystemController } from './file-system.controller';
import { CloudflareR2Module } from 'src/cloudflare-r2/cloudflare-r2.module';
import { FileSystemService } from './file-system.service';

@Module({
  imports: [CloudflareR2Module],
  providers: [FileSystemService],
  controllers: [FileSystemController],
})
export class FileSystemModule {}
