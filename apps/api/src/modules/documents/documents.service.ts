import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  list(patientId: string, isClinicalRequester: boolean) {
    const where: Record<string, unknown> = { patientId };
    if (!isClinicalRequester) where.isClinical = false;
    return this.prisma.document.findMany({ where: where as never, orderBy: { createdAt: 'desc' } });
  }

  async create(patientId: string, dto: { fileName: string; s3Key: string; mimeType: string; sizeBytes: number; category: string; isClinical?: boolean }) {
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
}
