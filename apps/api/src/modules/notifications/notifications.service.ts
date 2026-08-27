import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService) {}

  async enqueue(dto: { patientId: string; appointmentId?: string; channel: string; template: string; payload?: unknown }) {
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
    this.logger.log(`[FAKE] Notificação ${notif.id} ${dto.channel}/${dto.template} enfileirada`);
    // TODO: BullMQ + provider real (Resend/WhatsApp)
    await this.prisma.notification.update({ where: { id: notif.id }, data: { status: 'sent', sentAt: new Date() } as never });
    return notif;
  }

  list(q: Record<string, string>) {
    return this.prisma.notification.findMany({ where: q as never, orderBy: { createdAt: 'desc' }, take: 50 });
  }
}
