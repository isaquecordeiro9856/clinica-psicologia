import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulingService } from './scheduling.service';

const mockPrisma = {
  availabilityRule: { findMany: vi.fn() },
  timeBlock: { findMany: vi.fn() },
  appointment: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  service: { findFirst: vi.fn() },
  patient: { findFirst: vi.fn() },
  psychologist: { findUnique: vi.fn() },
  secretary: { findUnique: vi.fn() },
  billing: { create: vi.fn() },
};

const mockRedis = {
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
  cacheDelPattern: vi.fn(),
};

const mockQueue = {
  addExpirationJob: vi.fn(),
  removeJob: vi.fn(),
};

describe('SchedulingService', () => {
  let service: SchedulingService;
  const psychologistUser = { sub: 'user-psi-1', role: 'psychologist' };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SchedulingService(
      mockPrisma as never,
      mockRedis as never,
      mockQueue as never,
    );
    mockPrisma.service.findFirst.mockResolvedValue({
      id: 'svc-1',
      price: 200,
      durationMinutes: 50,
    });
    mockPrisma.patient.findFirst.mockResolvedValue({ id: 'pat-1' });
    mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psi-1' });
  });

  describe('createAppointment', () => {
    it('should reject an invalid time range before creating a lock', async () => {
      await expect(
        service.createAppointment({
          patientId: 'pat-1',
          psychologistId: 'psi-1',
          serviceId: 'svc-1',
          startAt: '2026-08-28T10:00:00Z',
          endAt: '2026-08-28T09:00:00Z',
        }),
      ).rejects.toThrow('término deve ser posterior');

      expect(mockRedis.acquireLock).not.toHaveBeenCalled();
    });

    it('should create appointment when slot is available', async () => {
      mockRedis.acquireLock.mockResolvedValue('lock-token-123');
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.create.mockResolvedValue({
        id: 'apt-1',
        status: 'pending_payment',
      });
      mockPrisma.billing.create.mockResolvedValue({ id: 'bill-1' });
      mockRedis.releaseLock.mockResolvedValue(true);

      const result = await service.createAppointment({
        patientId: 'pat-1',
        psychologistId: 'psi-1',
        serviceId: 'svc-1',
        startAt: '2026-08-28T09:00:00Z',
        endAt: '2026-08-28T09:50:00Z',
      });

      expect(result.id).toBe('apt-1');
      expect(mockRedis.acquireLock).toHaveBeenCalledOnce();
      expect(mockPrisma.appointment.create).toHaveBeenCalledOnce();
      expect(mockPrisma.billing.create).toHaveBeenCalledOnce();
      expect(mockQueue.addExpirationJob).toHaveBeenCalledOnce();
      expect(mockRedis.releaseLock).toHaveBeenCalledOnce();
    });

    it('should throw ConflictException when lock cannot be acquired', async () => {
      mockRedis.acquireLock.mockResolvedValue(null);

      await expect(
        service.createAppointment({
          patientId: 'pat-1',
          psychologistId: 'psi-1',
          serviceId: 'svc-1',
          startAt: '2026-08-28T09:00:00Z',
          endAt: '2026-08-28T09:50:00Z',
        }),
      ).rejects.toThrow('Horário sendo processado');
    });

    it('should throw ConflictException when slot has conflict', async () => {
      mockRedis.acquireLock.mockResolvedValue('lock-token-123');
      mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'existing-apt' });

      await expect(
        service.createAppointment({
          patientId: 'pat-1',
          psychologistId: 'psi-1',
          serviceId: 'svc-1',
          startAt: '2026-08-28T09:00:00Z',
          endAt: '2026-08-28T09:50:00Z',
        }),
      ).rejects.toThrow('Horário já reservado');

      expect(mockRedis.releaseLock).toHaveBeenCalledOnce();
    });

    it('should throw NotFoundException when service does not exist', async () => {
      mockRedis.acquireLock.mockResolvedValue('lock-token-123');
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.createAppointment({
          patientId: 'pat-1',
          psychologistId: 'psi-1',
          serviceId: 'nonexistent',
          startAt: '2026-08-28T09:00:00Z',
          endAt: '2026-08-28T09:50:00Z',
        }),
      ).rejects.toThrow('Serviço ativo não encontrado');
    });

    it('should always release lock even on error', async () => {
      mockRedis.acquireLock.mockResolvedValue('lock-token-123');
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.findFirst.mockRejectedValue(new Error('DB error'));

      try {
        await service.createAppointment({
          patientId: 'pat-1',
          psychologistId: 'psi-1',
          serviceId: 'svc-1',
          startAt: '2026-08-28T09:00:00Z',
          endAt: '2026-08-28T09:50:00Z',
        });
      } catch {
        // expected
      }

      expect(mockRedis.releaseLock).toHaveBeenCalledWith('lock:slot:psi-1:2026-08-28T09:00:00Z', 'lock-token-123');
    });
  });

  describe('cancel', () => {
    it('should cancel appointment and remove expiration job', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({ id: 'apt-1', psychologistId: 'psi-1' });
      mockPrisma.appointment.update.mockResolvedValue({ id: 'apt-1', status: 'cancelled' });
      mockQueue.removeJob.mockResolvedValue(undefined);

      const result = await service.cancel('apt-1', psychologistUser, 'Paciente desistiu');

      expect(result.status).toBe('cancelled');
      expect(mockQueue.removeJob).toHaveBeenCalledWith('expire:apt-1');
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.cancel('nonexistent', psychologistUser)).rejects.toThrow('Agendamento não encontrado');
    });

    it('should not allow a professional from another clinic to cancel an appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({ id: 'apt-1', psychologistId: 'psi-2' });

      await expect(service.cancel('apt-1', psychologistUser)).rejects.toThrow('Agendamento não encontrado');
      expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
    });
  });

  describe('reschedule', () => {
    it('should reschedule when new slot is available', async () => {
      mockRedis.acquireLock.mockResolvedValue('lock-token-456');
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        psychologistId: 'psi-1',
        status: 'confirmed',
      });
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.update.mockResolvedValue({
        id: 'apt-1',
        startAt: new Date('2026-08-29T10:00:00Z'),
        endAt: new Date('2026-08-29T10:50:00Z'),
      });

      const result = await service.reschedule('apt-1', psychologistUser, '2026-08-29T10:00:00Z', '2026-08-29T10:50:00Z');

      expect(result.id).toBe('apt-1');
      expect(mockRedis.releaseLock).toHaveBeenCalledOnce();
    });

    it('should throw when appointment is cancelled', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        psychologistId: 'psi-1',
        status: 'cancelled',
      });

      await expect(
        service.reschedule('apt-1', psychologistUser, '2026-08-29T10:00:00Z', '2026-08-29T10:50:00Z'),
      ).rejects.toThrow('cancelado ou finalizado');
    });

    it('should throw when new slot has conflict', async () => {
      mockRedis.acquireLock.mockResolvedValue('lock-token-456');
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        psychologistId: 'psi-1',
        status: 'confirmed',
      });
      mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'other-apt' });

      await expect(
        service.reschedule('apt-1', psychologistUser, '2026-08-29T10:00:00Z', '2026-08-29T10:50:00Z'),
      ).rejects.toThrow('já reservado');
    });
  });

  describe('getAvailability', () => {
    it('should return cached data when available', async () => {
      const cached = { rules: [], blocks: [], appointments: [] };
      mockRedis.cacheGet.mockResolvedValue(cached);

      const result = await service.getAvailability({
        psychologistId: 'psi-1',
        from: '2026-08-25',
        to: '2026-08-29',
      });

      expect(result).toEqual(cached);
      expect(mockPrisma.availabilityRule.findMany).not.toHaveBeenCalled();
    });

    it('should query DB and cache when cache miss', async () => {
      mockRedis.cacheGet.mockResolvedValue(null);
      mockPrisma.availabilityRule.findMany.mockResolvedValue([]);
      mockPrisma.timeBlock.findMany.mockResolvedValue([]);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.getAvailability({
        psychologistId: 'psi-1',
        from: '2026-08-25',
        to: '2026-08-29',
      });

      expect(result.rules).toEqual([]);
      expect(mockRedis.cacheSet).toHaveBeenCalledOnce();
    });
  });
});
