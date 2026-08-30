import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { QueueService } from '../../infra/queue/queue.service';
import { decrypt } from '../../infra/crypto/crypto.util';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queue: QueueService,
  ) {}

  private async psychologistIdFor(user: { sub: string; role: string }) {
    if (user.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({ where: { userId: user.sub }, select: { id: true } });
      if (!psychologist) throw new NotFoundException('Perfil de psicóloga não encontrado');
      return psychologist.id;
    }
    const secretary = await this.prisma.secretary.findUnique({ where: { userId: user.sub }, select: { psychologistId: true } });
    if (!secretary) throw new NotFoundException('Perfil de secretária não encontrado');
    return secretary.psychologistId;
  }

  private ensureValidTimeRange(startAt: string, endAt: string) {
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('O horário de término deve ser posterior ao horário de início');
    }
  }

  private async appointmentForStaff(id: string, user: { sub: string; role: string }) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    const psychologistId = await this.psychologistIdFor(user);
    if (appointment.psychologistId !== psychologistId) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return appointment;
  }

  async findOne(id: string, user: { sub: string; role: string }) {
    await this.appointmentForStaff(id, user);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
        psychologist: { select: { name: true } },
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
      },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (appointment.patient) {
      appointment.patient.email = appointment.patient.email ? decrypt(appointment.patient.email) : null;
      appointment.patient.phone = appointment.patient.phone ? decrypt(appointment.patient.phone) : null;
    }
    return appointment;
  }

  async listServices(user: { sub: string; role: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    return this.prisma.service.findMany({ where: { psychologistId, active: true }, orderBy: { name: 'asc' } });
  }

  async getAvailability(query: { psychologistId: string; from: string; to: string }) {
    const cacheKey = `availability:${query.psychologistId}:${query.from}:${query.to}`;
    const cached = await this.redis.cacheGet<{
      rules: unknown[];
      blocks: unknown[];
      appointments: unknown[];
    }>(cacheKey);
    if (cached) return cached;

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

    const result = { rules, blocks, appointments };
    await this.redis.cacheSet(cacheKey, result, 60); // cache 60s
    return result;
  }

  async createAppointment(dto: { patientId: string; psychologistId?: string; serviceId?: string; startAt: string; endAt: string }, user?: { sub: string; role: string }) {
    this.ensureValidTimeRange(dto.startAt, dto.endAt);
    const psychologistId = user ? await this.psychologistIdFor(user) : dto.psychologistId;
    if (!psychologistId) throw new NotFoundException('Psicóloga não encontrada');
    const selectedService = dto.serviceId
      ? await this.prisma.service.findFirst({ where: { id: dto.serviceId, psychologistId, active: true } })
      : await this.prisma.service.findFirst({ where: { psychologistId, active: true }, orderBy: { createdAt: 'asc' } });
    if (!selectedService) throw new NotFoundException('Serviço ativo não encontrado');
    const patient = await this.prisma.patient.findFirst({ where: { id: dto.patientId, psychologistId, deletedAt: null }, select: { id: true } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    // Distributed lock to prevent double-booking
    const lockKey = `lock:slot:${psychologistId}:${dto.startAt}`;
    const lockToken = await this.redis.acquireLock(lockKey, 10000);
    if (!lockToken) {
      throw new ConflictException('Horário sendo processado por outra requisição. Tente novamente.');
    }

    try {
      // Verify no conflict with SELECT-style check
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          psychologistId,
          status: { in: ['pending_payment', 'confirmed'] },
          OR: [
            { startAt: { lte: new Date(dto.startAt) }, endAt: { gt: new Date(dto.startAt) } },
            { startAt: { lt: new Date(dto.endAt) }, endAt: { gte: new Date(dto.endAt) } },
            { startAt: { gte: new Date(dto.startAt) }, endAt: { lte: new Date(dto.endAt) } },
          ],
        },
      });
      if (conflict) throw new ConflictException('Horário já reservado');

      const service = selectedService;
      if (!service) throw new NotFoundException('Serviço não encontrado');

      const appt = await this.prisma.appointment.create({
        data: {
          patientId: dto.patientId,
          psychologistId,
          serviceId: selectedService.id,
          startAt: new Date(dto.startAt),
          endAt: new Date(dto.endAt),
          status: 'pending_payment',
        } as never,
      });

      // Create pending billing
      await this.prisma.billing.create({
        data: {
          appointmentId: appt.id,
          patientId: dto.patientId,
          amount: selectedService.price,
          method: 'pix',
          status: 'pending',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        } as never,
      });

      // Schedule expiration job (15 minutes)
      try {
        await this.queue.addExpirationJob({
          appointmentId: appt.id,
          patientId: dto.patientId,
          psychologistId,
          startAt: dto.startAt,
        });
      } catch (error) {
        this.logger.warn(`Expiration job skipped for ${appt.id}: ${(error as Error).message}`);
      }

      // Invalidate availability cache
      await this.redis.cacheDelPattern(`availability:${psychologistId}:*`);

      this.logger.log(`Appointment created: ${appt.id}`);
      return appt;
    } finally {
      await this.redis.releaseLock(lockKey, lockToken);
    }
  }

  async listAppointments(
    query: { psychologistId?: string; patientId?: string; status?: string; from?: string; to?: string; page?: number; limit?: number },
    user?: { sub: string; role: string },
  ) {
    const where: Record<string, unknown> = {};

    // Scope by role
    if (user?.role === 'patient') {
      where.patientId = user.sub;
    } else if (user?.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({ where: { userId: user.sub }, select: { id: true } });
      where.psychologistId = psychologist?.id ?? '__none__';
    } else if (user?.role === 'secretary') {
      const secretary = await this.prisma.secretary.findUnique({ where: { userId: user.sub }, select: { psychologistId: true } });
      where.psychologistId = secretary?.psychologistId ?? '__none__';
    } else if (query.psychologistId) {
      where.psychologistId = query.psychologistId;
    }

    if (query.patientId && user?.role !== 'patient') where.patientId = query.patientId;
    if (query.status) {
      const statusMap: Record<string, string> = {
        pending: 'pending_payment',
        pending_payment: 'pending_payment',
        confirmed: 'confirmed',
        cancelled: 'cancelled',
        no_show: 'no_show',
        completed: 'completed',
      };
      where.status = statusMap[query.status] ?? query.status;
    }
    if (query.from || query.to) {
      where.startAt = {};
      if (query.from) (where.startAt as Record<string, unknown>).gte = new Date(query.from);
      if (query.to) (where.startAt as Record<string, unknown>).lte = new Date(query.to);
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const skip = (page - 1) * limit;

    const [rawData, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where: where as never,
        orderBy: { startAt: 'asc' },
        include: {
          patient: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, durationMinutes: true, price: true } },
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where: where as never }),
    ]);

    const data = rawData.map((apt) => ({
      ...apt,
      patient: apt.patient ? {
        ...apt.patient,
        email: apt.patient.email ? decrypt(apt.patient.email) : null,
        phone: apt.patient.phone ? decrypt(apt.patient.phone) : null,
      } : null,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancel(id: string, user: { sub: string; role: string }, reason?: string) {
    await this.appointmentForStaff(id, user);

    // Remove expiration job if exists
    await this.queue.removeJob(`expire:${id}`);

    return this.prisma.appointment.update({ where: { id }, data: { status: 'cancelled', cancelReason: reason } as never });
  }

  async remove(id: string, user: { sub: string; role: string }) {
    const appointment = await this.appointmentForStaff(id, user);
    if (appointment.status !== 'cancelled') {
      throw new ConflictException('So e possivel remover agendamentos cancelados');
    }
    return this.prisma.appointment.delete({ where: { id } });
  }

  async reschedule(id: string, user: { sub: string; role: string }, startAt: string, endAt: string) {
    this.ensureValidTimeRange(startAt, endAt);
    const existing = await this.appointmentForStaff(id, user);
    if (existing.status === 'cancelled' || existing.status === 'completed') {
      throw new ConflictException('Não é possível reagendar um agendamento cancelado ou finalizado');
    }

    // Lock on new slot
    const lockKey = `lock:slot:${existing.psychologistId}:${startAt}`;
    const lockToken = await this.redis.acquireLock(lockKey, 10000);
    if (!lockToken) {
      throw new ConflictException('Horário sendo processado por outra requisição. Tente novamente.');
    }

    try {
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          psychologistId: existing.psychologistId,
          id: { not: id },
          status: { in: ['pending_payment', 'confirmed'] },
          OR: [
            { startAt: { lte: new Date(startAt) }, endAt: { gt: new Date(startAt) } },
            { startAt: { lt: new Date(endAt) }, endAt: { gte: new Date(endAt) } },
            { startAt: { gte: new Date(startAt) }, endAt: { lte: new Date(endAt) } },
          ],
        },
      });
      if (conflict) throw new ConflictException('Novo horário já reservado');

      return this.prisma.appointment.update({
        where: { id },
        data: { startAt: new Date(startAt), endAt: new Date(endAt) },
      });
    } finally {
      await this.redis.releaseLock(lockKey, lockToken);
    }
  }

  async confirm(id: string, user: { sub: string; role: string }) {
    const existing = await this.appointmentForStaff(id, user);
    if (existing.status !== 'pending_payment') {
      throw new ConflictException('Apenas agendamentos pendentes podem ser confirmados');
    }
    return this.prisma.appointment.update({ where: { id }, data: { status: 'confirmed' } as never });
  }

  async complete(id: string, user: { sub: string; role: string }) {
    const existing = await this.appointmentForStaff(id, user);
    if (existing.status !== 'confirmed') {
      throw new ConflictException('Apenas agendamentos confirmados podem ser finalizados');
    }
    return this.prisma.appointment.update({ where: { id }, data: { status: 'completed' } as never });
  }

  async noShow(id: string, user: { sub: string; role: string }) {
    const existing = await this.appointmentForStaff(id, user);
    if (existing.status !== 'confirmed') {
      throw new ConflictException('Apenas agendamentos confirmados podem ser marcados como não compareceu');
    }
    return this.prisma.appointment.update({ where: { id }, data: { status: 'no_show' } as never });
  }
}
