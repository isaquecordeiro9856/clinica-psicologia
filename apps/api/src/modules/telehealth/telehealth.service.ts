import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class TelehealthService {
  private readonly logger = new Logger(TelehealthService.name);
  private readonly jitsiDomain: string;

  constructor(private prisma: PrismaService) {
    this.jitsiDomain = process.env.JITSI_DOMAIN ?? 'localhost:8443';
  }

  private async appointmentForRequester(appointmentId: string, requester: { sub: string; role: string }) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');

    if (requester.role === 'psychologist') {
      const psychologist = await this.prisma.psychologist.findUnique({ where: { userId: requester.sub }, select: { id: true } });
      if (psychologist?.id === appointment.psychologistId) return appointment;
    } else if (requester.role === 'patient') {
      const patient = await this.prisma.patient.findUnique({ where: { userId: requester.sub }, select: { id: true } });
      if (patient?.id === appointment.patientId) return appointment;
    }

    throw new ForbiddenException('Sem acesso a esta teleconsulta');
  }

  private async sessionForRequester(sessionId: string, requester: { sub: string; role: string }) {
    const session = await this.prisma.telehealthSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sessão de teleconsulta não encontrada');
    await this.appointmentForRequester(session.appointmentId, requester);
    return session;
  }

  /**
   * Create a Jitsi Meet room for a telehealth session.
   * Uses random room name for privacy.
   */
  async createRoom(appointmentId: string, requester: { sub: string; role: string }) {
    const appointment = await this.appointmentForRequester(appointmentId, requester);
    if (appointment.modality !== 'online') {
      throw new ConflictException('Este agendamento não é uma teleconsulta');
    }
    if (!['confirmed', 'pending_payment'].includes(appointment.status)) {
      throw new ConflictException('A teleconsulta não está disponível para este agendamento');
    }

    const existing = await this.prisma.telehealthSession.findUnique({ where: { appointmentId } });
    if (existing) {
      return {
        sessionId: existing.id,
        roomName: existing.roomName,
        roomUrl: `https://${this.jitsiDomain}/${existing.roomName}`,
        domain: this.jitsiDomain,
      };
    }
    const roomName = `clinica-${randomBytes(8).toString('hex')}`;

    // Create telehealth session record
    const session = await this.prisma.telehealthSession.create({
      data: {
        appointmentId,
        roomName,
        startedAt: new Date(),
      },
    });

    this.logger.log(`[TELEHEALTH] Room created: ${roomName} for appointment ${appointmentId}`);

    return {
      sessionId: session.id,
      roomName,
      roomUrl: `https://${this.jitsiDomain}/${roomName}`,
      domain: this.jitsiDomain,
    };
  }

  /**
   * Get telehealth session details.
   */
  async getSession(sessionId: string, requester: { sub: string; role: string }) {
    return this.sessionForRequester(sessionId, requester);
  }

  /**
   * End a telehealth session.
   */
  async endSession(sessionId: string, requester: { sub: string; role: string }) {
    const session = await this.sessionForRequester(sessionId, requester);
    return this.prisma.telehealthSession.update({
      where: { id: session.id },
      data: { endedAt: new Date() },
    });
  }
}
