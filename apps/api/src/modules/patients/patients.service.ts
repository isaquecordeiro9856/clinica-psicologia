import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { encrypt, decrypt, hmac } from '../../infra/crypto/crypto.util';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async list(psychologistId: string, query: { page?: number; limit?: number; search?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = { psychologistId, deletedAt: null };
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

  async create(psychologistId: string, dto: { name: string; cpf?: string; phone?: string; email?: string; birthDate?: string }) {
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
      data: { actorUserId: psychologistId, action: 'create', entityType: 'patient', entityId: patient.id },
    });
    return patient;
  }

  async findOne(id: string, requester: { sub: string; role: string; psychologistId?: string }) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    // Ownership check para psychologist
    if (requester.role === 'psychologist' && patient.psychologistId !== requester.sub && patient.psychologistId !== requester.psychologistId) {
      // tenta resolver via Psychologist table
      const psy = await this.prisma.psychologist.findUnique({ where: { userId: requester.sub } });
      if (!psy || psy.id !== patient.psychologistId) throw new ForbiddenException('Sem acesso a este paciente');
    }
    if (requester.role === 'patient') {
      const own = await this.prisma.patient.findFirst({ where: { id, userId: requester.sub } });
      if (!own) throw new ForbiddenException('Acesso negado');
    }
    // Secretaria pode ver, mas sem decriptar? MVP: decripta mas controller filtra se isClinical
    return {
      ...patient,
      cpf: patient.cpf ? decrypt(patient.cpf) : null,
      phone: patient.phone ? decrypt(patient.phone) : null,
      email: patient.email ? decrypt(patient.email) : null,
    };
  }

  async exportData(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id }, include: { consents: true, formResponses: true, billings: true, appointments: true } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    return { data: patient, exportedAt: new Date().toISOString() };
  }
}
