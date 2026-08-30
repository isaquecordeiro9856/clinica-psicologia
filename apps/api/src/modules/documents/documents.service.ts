import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { S3Service } from '../../infra/s3/s3.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  private async patientForRequester(patientId: string, requester: { sub: string; role: string }) {
    if (requester.role === 'patient') {
      const patient = await this.prisma.patient.findFirst({ where: { id: patientId, userId: requester.sub, deletedAt: null } });
      if (!patient) throw new NotFoundException('Paciente não encontrado');
      return patient;
    }

    const psychologistId = requester.role === 'psychologist'
      ? (await this.prisma.psychologist.findUnique({ where: { userId: requester.sub }, select: { id: true } }))?.id
      : requester.role === 'secretary'
        ? (await this.prisma.secretary.findUnique({ where: { userId: requester.sub }, select: { psychologistId: true } }))?.psychologistId
        : null;
    if (!psychologistId) throw new ForbiddenException('Acesso negado');

    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, psychologistId, deletedAt: null } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    return patient;
  }

  async list(patientId: string, requester: { sub: string; role: string }) {
    await this.patientForRequester(patientId, requester);
    const where: Record<string, unknown> = { patientId };
    if (requester.role !== 'psychologist') where.isClinical = false;
    return this.prisma.document.findMany({ where: where as never, orderBy: { createdAt: 'desc' } });
  }

  async create(patientId: string, requester: { sub: string; role: string }, dto: { fileName: string; s3Key: string; mimeType: string; sizeBytes: number; category: string; isClinical?: boolean }) {
    await this.patientForRequester(patientId, requester);
    if (dto.isClinical && requester.role !== 'psychologist') {
      throw new ForbiddenException('Documentos clínicos só podem ser registrados pela psicóloga');
    }
    return this.prisma.document.create({
      data: {
        patientId,
        fileName: dto.fileName,
        s3Key: dto.s3Key,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        category: dto.category as never,
        isClinical: dto.isClinical ?? false,
      } as never,
    });
  }

  async uploadAndRegister(
    patientId: string,
    requester: { sub: string; role: string },
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    category: string,
    isClinical?: boolean,
  ) {
    await this.patientForRequester(patientId, requester);

    if (!this.s3.validateFileType(file.mimetype)) {
      throw new ForbiddenException('Tipo de arquivo não permitido');
    }
    if (!this.s3.validateFileSize(file.size)) {
      throw new ForbiddenException('Arquivo muito grande (máx. 50MB)');
    }

    if (isClinical && requester.role !== 'psychologist') {
      throw new ForbiddenException('Documentos clínicos só podem ser registrados pela psicóloga');
    }

    const s3Key = this.s3.generateKey(patientId, file.originalname);
    await this.s3.uploadFile(s3Key, file.buffer, file.mimetype);

    return this.prisma.document.create({
      data: {
        patientId,
        fileName: file.originalname,
        s3Key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category: category as never,
        isClinical: isClinical ?? false,
      } as never,
    });
  }

  async getDownloadUrl(documentId: string, requester: { sub: string; role: string }) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException('Documento não encontrado');

    await this.patientForRequester(document.patientId, requester);

    const url = await this.s3.getPresignedDownloadUrl(document.s3Key, 3600);
    return { url, fileName: document.fileName, mimeType: document.mimeType };
  }

  async delete(documentId: string, requester: { sub: string; role: string }) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException('Documento não encontrado');

    await this.patientForRequester(document.patientId, requester);

    if (document.isClinical && requester.role !== 'psychologist') {
      throw new ForbiddenException('Apenas a psicóloga pode excluir documentos clínicos');
    }

    await this.s3.deleteFile(document.s3Key);
    await this.prisma.document.delete({ where: { id: documentId } });

    return { success: true };
  }
}