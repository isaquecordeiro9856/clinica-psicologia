import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { encrypt, decrypt, hmac } from '../../infra/crypto/crypto.util';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  private async psychologistIdFor(user: { sub: string; role: string }) {
    if (user.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({ where: { userId: user.sub }, select: { id: true } });
      if (!psychologist) throw new ForbiddenException('Perfil de psicóloga não encontrado');
      return psychologist.id;
    }
    const secretary = await this.prisma.secretary.findUnique({ where: { userId: user.sub }, select: { psychologistId: true } });
    if (!secretary) throw new ForbiddenException('Perfil de secretária não encontrado');
    return secretary.psychologistId;
  }

  async list(user: { sub: string; role: string }, query: { page?: number; limit?: number; search?: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { psychologistId, deletedAt: null };
    if (query.search?.trim()) {
      where.name = { contains: query.search.trim(), mode: 'insensitive' };
    }
    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where: where as never }),
    ]);
    // Decripta campos para psicóloga (secretaria receberia filtrado no controller)
    const mapped = data.map((p) => ({
      ...p,
      cpf: p.cpf ? decrypt(p.cpf) : null,
      phone: p.phone ? decrypt(p.phone) : null,
      email: p.email ? decrypt(p.email) : null,
    }));
    return { data: mapped, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(user: { sub: string; role: string }, dto: { name: string; cpf?: string; phone?: string; email?: string; birthDate?: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    const data: Record<string, unknown> = {
      name: dto.name,
      psychologistId,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
    };
    if (dto.cpf) {
      data.cpf = encrypt(dto.cpf.replace(/\D/g, ''));
      data.cpfHash = hmac(dto.cpf.replace(/\D/g, ''));
    }
    if (dto.phone) {
      data.phone = encrypt(dto.phone);
      data.phoneHash = hmac(dto.phone);
    }
    if (dto.email) data.email = encrypt(dto.email);

    const patient = await this.prisma.patient.create({ data: data as never });
    await this.prisma.auditLog.create({
      data: { actorUserId: user.sub, action: 'create', entityType: 'patient', entityId: patient.id },
    });
    return patient;
  }

  async update(id: string, user: { sub: string; role: string }, dto: { name?: string; cpf?: string; phone?: string; email?: string; birthDate?: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    const existing = await this.prisma.patient.findFirst({ where: { id, psychologistId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Paciente não encontrado');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.birthDate !== undefined) data.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.cpf !== undefined) {
      const value = dto.cpf.replace(/\D/g, '');
      data.cpf = value ? encrypt(value) : null;
      data.cpfHash = value ? hmac(value) : null;
    }
    if (dto.phone !== undefined) {
      const value = dto.phone.replace(/\D/g, '');
      data.phone = value ? encrypt(value) : null;
      data.phoneHash = value ? hmac(value) : null;
    }
    if (dto.email !== undefined) data.email = dto.email ? encrypt(dto.email) : null;
    return this.prisma.patient.update({ where: { id }, data: data as never });
  }

  async remove(id: string, user: { sub: string; role: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    const existing = await this.prisma.patient.findFirst({ where: { id, psychologistId, deletedAt: null }, select: { id: true } });
    if (!existing) throw new NotFoundException('Paciente não encontrado');
    return this.prisma.patient.update({ where: { id }, data: { deletedAt: new Date(), status: 'inactive' } });
  }

  async findOne(id: string, requester: { sub: string; role: string; psychologistId?: string }) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    if (requester.role === 'psychologist' || requester.role === 'secretary') {
      const psychologistId = await this.psychologistIdFor(requester);
      if (patient.psychologistId !== psychologistId) throw new ForbiddenException('Sem acesso a este paciente');
    } else if (requester.role === 'patient') {
      if (patient.userId !== requester.sub) throw new ForbiddenException('Acesso negado');
    } else {
      throw new ForbiddenException('Acesso negado');
    }
    // Secretaria pode ver, mas sem decriptar? MVP: decripta mas controller filtra se isClinical
    return {
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : null,
      phone: patient.phone ? decrypt(patient.phone) : null,
      email: patient.email ? decrypt(patient.email) : null,
    };
  }

  async exportData(id: string, requester: { sub: string; role: string }) {
    const psychologistId = await this.psychologistIdFor(requester);
    const patient = await this.prisma.patient.findFirst({
      where: { id, psychologistId, deletedAt: null },
      include: { consents: true, formResponses: true, billings: true, appointments: true },
    });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    return { data: patient, exportedAt: new Date().toISOString() };
  }

  async createConsent(patientId: string, requester: { sub: string; role: string }, dto: { type: string; version: string; textSnapshot: string; ip?: string }) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    if (requester.role === 'psychologist' || requester.role === 'secretary') {
      const psychologistId = await this.psychologistIdFor(requester);
      if (patient.psychologistId !== psychologistId) throw new ForbiddenException('Sem acesso a este paciente');
    } else if (requester.role === 'patient') {
      if (patient.userId !== requester.sub) throw new ForbiddenException('Acesso negado');
    } else {
      throw new ForbiddenException('Acesso negado');
    }

    const consent = await this.prisma.consent.create({
      data: {
        patientId,
        type: dto.type as 'lgpd' | 'treatment' | 'teleconsult' | 'image',
        version: dto.version,
        textSnapshot: dto.textSnapshot,
        signedAt: new Date(),
        ip: dto.ip,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: requester.sub,
        action: 'create',
        entityType: 'consent',
        entityId: consent.id,
      },
    });

    return consent;
  }
}
