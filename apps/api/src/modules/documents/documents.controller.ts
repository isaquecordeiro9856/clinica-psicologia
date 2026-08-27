import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@Controller('patients/:patientId/documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class DocumentsController {
  constructor(private docs: DocumentsService) {}

  @Get()
  list(@Param('patientId') pid: string, @CurrentUser() user: { role: string }) {
    const isClinical = user.role === 'psychologist';
    return this.docs.list(pid, isClinical).then((data) => ({ data }));
  }

  @Post()
  create(@Param('patientId') pid: string, @Body() dto: { fileName: string; s3Key: string; mimeType: string; sizeBytes: number; category: string; isClinical?: boolean }) {
    return this.docs.create(pid, dto).then((data) => ({ data }));
  }
}
