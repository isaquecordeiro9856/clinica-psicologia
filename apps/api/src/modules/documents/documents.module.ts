import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { S3Module } from '../../infra/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
