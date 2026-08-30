import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { TelegramNotificationProvider } from '../../infra/providers/notification/telegram-notification.provider';
import { BrevoEmailProvider } from '../../infra/providers/email/brevo-email.provider';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private telegram: TelegramNotificationProvider,
    private email: BrevoEmailProvider,
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

  async enqueue(dto: { patientId: string; appointmentId?: string; channel: string; template: string; payload?: string }, user: { sub: string; role: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    const patient = await this.prisma.patient.findFirst({ where: { id: dto.patientId, psychologistId, deletedAt: null }, select: { id: true } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findFirst({ where: { id: dto.appointmentId, patientId: dto.patientId, psychologistId }, select: { id: true } });
      if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    }

    const notif = await this.prisma.notification.create({
      data: {
        patientId: dto.patientId,
        appointmentId: dto.appointmentId ?? null,
        channel: dto.channel as never,
        template: dto.template as never,
        status: 'queued',
        payload: dto.payload as never,
      } as never,
    });

    this.logger.log(`Notification queued: ${notif.id}`);

    return notif;
  }

  async list(q: { patientId?: string; status?: string }, user: { sub: string; role: string }) {
    const psychologistId = await this.psychologistIdFor(user);
    const where: Record<string, unknown> = { patient: { psychologistId } };
    if (q.patientId) where.patientId = q.patientId;
    if (q.status) where.status = q.status;
    return this.prisma.notification.findMany({ where: where as never, orderBy: { createdAt: 'desc' }, take: 50 });
  }
}
