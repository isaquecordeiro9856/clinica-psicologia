import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PixStaticProvider } from '../../infra/providers/payment/pix-static.provider';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private pixProvider: PixStaticProvider,
  ) {}

  private async psychologistIdFor(user: { sub: string; role: string }) {
    if (user.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({ where: { userId: user.sub }, select: { id: true } });
      if (!psychologist) throw new NotFoundException('Perfil de psicóloga não encontrado');
      return psychologist.id;
    }
    if (user.role === 'secretary') {
      const secretary = await this.prisma.secretary.findUnique({ where: { userId: user.sub }, select: { psychologistId: true } });
      if (!secretary) throw new NotFoundException('Perfil de secretária não encontrado');
      return secretary.psychologistId;
    }
    return null;
  }

  private async billingForStaff(id: string, user: { sub: string; role: string }) {
    if (user.role === 'admin') {
      const billing = await this.prisma.billing.findUnique({ where: { id } });
      if (!billing) throw new NotFoundException('Cobrança não encontrada');
      return billing;
    }
    const psychologistId = await this.psychologistIdFor(user);
    const billing = await this.prisma.billing.findFirst({
      where: { id, patient: { psychologistId: psychologistId ?? '__none__' } } as never,
    });
    if (!billing) throw new NotFoundException('Cobrança não encontrada');
    return billing;
  }

  async list(
    q: { page?: number; limit?: number; status?: string; patientId?: string },
    user?: { sub: string; role: string },
  ) {
    const where: Record<string, unknown> = {};

    if (user?.role === 'patient') {
      const patient = await this.prisma.patient.findUnique({ where: { userId: user.sub }, select: { id: true } });
      where.patientId = patient?.id ?? '__none__';
    } else if (user && user.role !== 'admin') {
      const psychologistId = await this.psychologistIdFor(user);
      where.patient = { psychologistId: psychologistId ?? '__none__' };
      if (q.patientId) where.patientId = q.patientId;
    } else if (q.patientId) {
      where.patientId = q.patientId;
    }

    if (q.status) where.status = q.status;

    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 50));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.billing.findMany({
        where: where as never,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, appointment: true },
        skip,
        take: limit,
      }),
      this.prisma.billing.count({ where: where as never }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(
    user: { sub: string; role: string },
    dto: { patientId: string; amount: number; method?: string; dueDate?: string; appointmentId?: string; description?: string },
  ) {
    const psychologistId = await this.psychologistIdFor(user);
    if (!psychologistId) throw new NotFoundException('Psicologa nao encontrada');

    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, psychologistId, deletedAt: null },
      select: { id: true },
    });
    if (!patient) throw new NotFoundException('Paciente nao encontrado');

    if (dto.amount <= 0) throw new BadRequestException('Valor deve ser maior que zero');

    const billing = await this.prisma.billing.create({
      data: {
        patientId: dto.patientId,
        appointmentId: dto.appointmentId ?? null,
        amount: dto.amount,
        method: (dto.method as never) ?? 'pix',
        status: 'pending',
        dueAt: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      } as never,
    });

    this.logger.log(`Billing created: ${billing.id}`);
    return billing;
  }

  async update(
    id: string,
    user: { sub: string; role: string },
    dto: { amount?: number; method?: string; dueDate?: string; status?: string },
  ) {
    await this.billingForStaff(id, user);

    const data: Record<string, unknown> = {};
    if (dto.amount !== undefined) {
      if (dto.amount <= 0) throw new BadRequestException('Valor deve ser maior que zero');
      data.amount = dto.amount;
    }
    if (dto.method !== undefined) data.method = dto.method;
    if (dto.dueDate !== undefined) data.dueAt = new Date(dto.dueDate);
    if (dto.status !== undefined) {
      if (!['pending', 'paid', 'overdue', 'cancelled', 'refunded'].includes(dto.status)) {
        throw new BadRequestException('Status invalido');
      }
      data.status = dto.status;
      if (dto.status === 'paid') data.paidAt = new Date();
    }

    return this.prisma.billing.update({ where: { id }, data: data as never });
  }

  async remove(id: string, user: { sub: string; role: string }) {
    const billing = await this.billingForStaff(id, user);
    if (billing.status === 'paid') {
      throw new BadRequestException('Nao e possivel excluir uma cobranca ja paga');
    }
    await this.prisma.billing.delete({ where: { id } });
    return { deleted: true };
  }

  async createPix(billingId: string, user: { sub: string; role: string }) {
    const billing = await this.billingForStaff(billingId, user);

    const { payload } = await this.pixProvider.generateQrCode({
      amount: Number(billing.amount),
      transactionId: billingId.substring(0, 25),
      description: `Consulta - ${billing.patientId}`,
    });

    return this.prisma.billing.update({
      where: { id: billingId },
      data: { pixQrCode: payload, pixCopyPaste: payload, pspTxId: `static-${billingId}` } as never,
    });
  }

  async markPaid(id: string, user: { sub: string; role: string }) {
    await this.billingForStaff(id, user);
    return this.prisma.billing.update({ where: { id }, data: { status: 'paid', paidAt: new Date() } as never });
  }

  async webhookPix(payload: { txid: string; status: string; eventId: string }) {
    const exists = await this.prisma.webhookEvent.findUnique({ where: { eventId: payload.eventId } });
    if (exists) return { status: 'already_processed' };
    await this.prisma.webhookEvent.create({ data: { eventId: payload.eventId, source: 'efi', payload: payload as never, status: 'received' } });
    const billing = await this.prisma.billing.findFirst({ where: { pspTxId: payload.txid } });
    if (billing && payload.status === 'pago') {
      await this.prisma.billing.update({ where: { id: billing.id }, data: { status: 'paid', paidAt: new Date() } as never });
      if (billing.appointmentId) {
        await this.prisma.appointment.update({ where: { id: billing.appointmentId }, data: { status: 'confirmed' } as never });
      }
    }
    await this.prisma.webhookEvent.update({ where: { eventId: payload.eventId }, data: { status: 'processed' } });
    return { status: 'processed' };
  }
}
