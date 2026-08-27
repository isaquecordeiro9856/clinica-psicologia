import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { encrypt, decrypt, hashContent } from '../../infra/crypto/crypto.util';

@Injectable()
export class ClinicalRecordsService {
  constructor(private prisma: PrismaService) {}

  private async assertOwnership(psychologistUserId: string, patientId: string) {
    const psy = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    // Se psicóloga ainda não tem perfil, compara direto (compatibilidade seed)
    const ownerId = psy ? psy.id : psychologistUserId;
    if (patient.psychologistId !== ownerId) throw new ForbiddenException('Paciente não pertence a esta psicóloga');
    return { psy, patient };
  }

  async list(patientId: string, psychologistUserId: string) {
    await this.assertOwnership(psychologistUserId, patientId);
    const records = await this.prisma.clinicalRecord.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } });
    // Audita
    await this.prisma.auditLog.create({ data: { actorUserId: psychologistUserId, actorRole: 'psychologist', action: 'view', entityType: 'clinical_record', entityId: patientId } });
    return records.map((r) => ({ ...r, content: decrypt(r.contentEncrypted) }));
  }

  async create(patientId: string, psychologistUserId: string, dto: { content: string; appointmentId?: string; type?: string }) {
    const { psy } = await this.assertOwnership(psychologistUserId, patientId);
    const psychologistId = psy ? psy.id : psychologistUserId;
    const contentEncrypted = encrypt(dto.content);
    const record = await this.prisma.clinicalRecord.create({
      data: {
        patientId,
        psychologistId,
        appointmentId: dto.appointmentId ?? null,
        type: (dto.type as never) ?? 'evolution',
        contentEncrypted,
        contentHash: hashContent(dto.content),
      } as never,
    });
    await this.prisma.auditLog.create({ data: { actorUserId: psychologistUserId, actorRole: 'psychologist', action: 'create', entityType: 'clinical_record', entityId: record.id } });
    return { ...record, content: dto.content };
  }

  async getOne(id: string, psychologistUserId: string) {
    const record = await this.prisma.clinicalRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Registro não encontrado');
    await this.assertOwnership(psychologistUserId, record.patientId);
    await this.prisma.auditLog.create({ data: { actorUserId: psychologistUserId, actorRole: 'psychologist', action: 'view', entityType: 'clinical_record', entityId: id } });
    return { ...record, content: decrypt(record.contentEncrypted) };
  }
}
