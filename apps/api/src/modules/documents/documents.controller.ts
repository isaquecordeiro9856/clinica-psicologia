import { Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MulterFile } from '../../common/types/multer-file';

@ApiTags('documents')
@Controller('patients/:patientId/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DocumentsController {
  constructor(private docs: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar documentos do paciente' })
  list(@Param('patientId') pid: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.docs.list(pid, user).then((data) => ({ data }));
  }

  @Post()
  @ApiOperation({ summary: 'Registrar documento (metadados)' })
  @Roles('psychologist', 'secretary')
  create(@Param('patientId') pid: string, @CurrentUser() user: { sub: string; role: string }, @Body() dto: CreateDocumentDto) {
    return this.docs.create(pid, user, dto).then((data) => ({ data }));
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload de arquivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string', enum: ['consent', 'receipt', 'certificate', 'attachment'] },
        isClinical: { type: 'boolean', default: false },
      },
    },
  })
  @Roles('psychologist', 'secretary')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('patientId') pid: string,
    @CurrentUser() user: { sub: string; role: string },
    @UploadedFile() file: MulterFile,
    @Body('category') category: string,
    @Body('isClinical') isClinical?: string,
  ) {
    const result = await this.docs.uploadAndRegister(pid, user, file, category, isClinical === 'true');
    return { data: result };
  }

  @Get(':documentId/download')
  @ApiOperation({ summary: 'Obter URL de download' })
  async getDownloadUrl(
    @Param('patientId') pid: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: { sub: string; role: string },
    @Res() res: Response,
  ) {
    const { url, fileName, mimeType } = await this.docs.getDownloadUrl(documentId, user);
    return res.redirect(url);
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Excluir documento' })
  @Roles('psychologist', 'secretary')
  async delete(
    @Param('patientId') pid: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.docs.delete(documentId, user).then((data) => ({ data }));
  }
}