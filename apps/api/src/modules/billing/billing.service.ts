import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  list(q: Record<string, string>) {
    const where: Record<string, unknown> = {};
    if (q.patientId) where.patientId = q.patientId;
    if (q.status) where.status = q.status;
    return this.prisma.billing.findMany({ where: where as never, orderBy: { createdAt: 'desc' } });
  }

  // Abstração de provider: Fake no MVP, troca para Efi/Mpago depois
  async createPix(billingId: string) {
    const billing = await this.prisma.billing.findUnique({ where: { id: billingId } });
    if (!billing) throw new Error('Cobrança não encontrada');
    // Simula QR Code
    const fakeQr = `00020126FAKE-PIX-${billingId.slice(0, 8)}5204000053039865405${Number(billing.amount).toFixed(2)}`;
    return this.prisma.billing.update({
      where: { id: billingId },
      data: { pixQrCode: fakeQr, pixCopyPaste: fakeQr, pspTxId: `fake-${Date.now()}` } as never,
    });
  }

  async markPaid(id: string) {
    return this.prisma.billing.update({ where: { id }, data: { status: 'paid', paidAt: new Date() } as never });
  }

  async webhookPix(payload: { txid: string; status: string; eventId: string }) {
    // Idempotência
    const exists = await this.prisma.webhookEvent.findUnique({ where: { eventId: payload.eventId } });
    if (exists) return { status: 'already_processed' };
    await this.prisma.webhookEvent.create({ data: { eventId: payload.eventId, source: 'efi', payload: payload as never, status: 'received' } });
    // Atualiza billing por pspTxId
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
