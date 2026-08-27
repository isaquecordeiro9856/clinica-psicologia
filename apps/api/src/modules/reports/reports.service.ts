import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async financial(psychologistId: string, from: string, to: string) {
    const billings = await this.prisma.billing.findMany({
      where: {
        patient: { psychologistId },
        createdAt: { gte: new Date(from), lte: new Date(to) },
      } as never,
    });
    const total = billings.reduce((acc, b) => acc + Number(b.amount), 0);
    const paid = billings.filter((b) => b.status === 'paid').reduce((acc, b) => acc + Number(b.amount), 0);
    const pending = billings.filter((b) => b.status === 'pending').reduce((acc, b) => acc + Number(b.amount), 0);
    const overdue = billings.filter((b) => b.status === 'overdue').length;
    return { total, paid, pending, overdue, count: billings.length };
  }

  async occupancy(psychologistId: string, from: string, to: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { psychologistId, startAt: { gte: new Date(from), lte: new Date(to) } },
    });
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const noShow = appointments.filter((a) => a.status === 'no_show').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    return { total, completed, noShow, cancelled, occupancyRate: total ? completed / total : 0 };
  }
}
