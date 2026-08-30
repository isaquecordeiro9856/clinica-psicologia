import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

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

  async dashboard(user: { sub: string; role: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const psychologistId = await this.psychologistIdFor(user);

    const todayAppointments = await this.prisma.appointment.findMany({
      where: {
        psychologistId,
        startAt: { gte: today, lt: tomorrow },
      },
    });

    const totalPatients = await this.prisma.patient.count({ where: { psychologistId, deletedAt: null } });
    const billingScope = { patient: { psychologistId } };
    const pendingBillings = await this.prisma.billing.count({ where: { ...billingScope, status: 'pending' } as never });
    const totalRevenue = await this.prisma.billing.aggregate({
      where: { ...billingScope, status: 'paid' } as never,
      _sum: { amount: true },
    });

    return {
      todayAppointments: todayAppointments.length,
      completedToday: todayAppointments.filter((a) => a.status === 'completed').length,
      pendingToday: todayAppointments.filter((a) => a.status === 'pending_payment').length,
      totalPatients,
      pendingBillings,
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    };
  }

  async financial(user: { sub: string; role: string }, from: string, to: string) {
    const psychologistId = await this.psychologistIdFor(user);
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

  async occupancy(user: { sub: string; role: string }, from: string, to: string) {
    const psychologistId = await this.psychologistIdFor(user);
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
