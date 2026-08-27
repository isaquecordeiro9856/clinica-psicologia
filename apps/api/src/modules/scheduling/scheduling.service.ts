import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(query: { psychologistId: string; from: string; to: string }) {
    const rules = await this.prisma.availabilityRule.findMany({ where: { psychologistId: query.psychologistId } });
    const blocks = await this.prisma.timeBlock.findMany({
      where: {
        psychologistId: query.psychologistId,
        startAt: { gte: new Date(query.from) },
        endAt: { lte: new Date(query.to) },
      },
    });
    const appointments = await this.prisma.appointment.findMany({
      where: {
        psychologistId: query.psychologistId,
        startAt: { gte: new Date(query.from), lte: new Date(query.to) },
        status: { in: ['pending_payment', 'confirmed'] },
      },
    });
    // MVP: retorna regras + bloqueios + agendamentos; cálculo de slots fica no front
    // Fase 2: gerar slots de 50min aqui com cache Redis
    return { rules, blocks, appointments };
  }

  async createAppointment(dto: { patientId: string; psychologistId: string; serviceId: string; startAt: string; endAt: string }) {
    // TODO: Redis lock SETNX + SELECT FOR UPDATE para evitar double-booking
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        psychologistId: dto.psychologistId,
        status: { in: ['pending_payment', 'confirmed'] },
        OR: [
          { startAt: { lte: new Date(dto.startAt) }, endAt: { gt: new Date(dto.startAt) } },
          { startAt: { lt: new Date(dto.endAt) }, endAt: { gte: new Date(dto.endAt) } },
          { startAt: { gte: new Date(dto.startAt) }, endAt: { lte: new Date(dto.endAt) } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Horário já reservado');

    const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado');

    const appt = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        psychologistId: dto.psychologistId,
        serviceId: dto.serviceId,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        status: 'pending_payment',
      } as never,
    });

    // Cria billing pendente automaticamente
    await this.prisma.billing.create({
      data: {
        appointmentId: appt.id,
        patientId: dto.patientId,
        amount: service.price,
        method: 'pix',
        status: 'pending',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as never,
    });

    return appt;
  }

  async listAppointments(query: { psychologistId?: string; patientId?: string; status?: string; from?: string; to?: string }) {
    const where: Record<string, unknown> = {};
    if (query.psychologistId) where.psychologistId = query.psychologistId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.startAt = {};
      if (query.from) (where.startAt as Record<string, unknown>).gte = new Date(query.from);
      if (query.to) (where.startAt as Record<string, unknown>).lte = new Date(query.to);
    }
    return this.prisma.appointment.findMany({ where: where as never, orderBy: { startAt: 'asc' }, include: { patient: true, service: true } });
  }

  async cancel(id: string, reason?: string) {
    // TODO: aplicar política de cancelamento (24h -> taxa)
    return this.prisma.appointment.update({ where: { id }, data: { status: 'cancelled', cancelReason: reason } as never });
  }
}
