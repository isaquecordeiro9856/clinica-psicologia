import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientsService } from './patients.service';

const mockPrisma = {
  patient: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  psychologist: { findUnique: vi.fn() },
  consent: { create: vi.fn() },
  auditLog: { create: vi.fn() },
};

vi.mock('../../infra/crypto/crypto.util', () => ({
  encrypt: (val: string) => `encrypted:${val}`,
  decrypt: (val: string) => val.replace('encrypted:', ''),
  hmac: (val: string) => `hash:${val}`,
}));

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PatientsService(mockPrisma as never);
    mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psi-1' });
  });

  describe('create', () => {
    it('should create patient with encrypted fields', async () => {
      mockPrisma.patient.create.mockResolvedValue({ id: 'pat-1', name: 'Ana' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.create({ sub: 'psi-1', role: 'psychologist' }, {
        name: 'Ana Beatriz',
        cpf: '12345678901',
        phone: '(11) 99876-5432',
        email: 'ana@email.com',
      });

      expect(result.id).toBe('pat-1');
      expect(mockPrisma.patient.create).toHaveBeenCalledOnce();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: { actorUserId: 'psi-1', action: 'create', entityType: 'patient', entityId: 'pat-1' },
      });
    });

    it('should create patient without optional fields', async () => {
      mockPrisma.patient.create.mockResolvedValue({ id: 'pat-2', name: 'Carlos' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.create({ sub: 'psi-1', role: 'psychologist' }, { name: 'Carlos' });

      expect(result.id).toBe('pat-2');
    });
  });

  describe('list', () => {
    it('should return paginated patients', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([
        { id: 'pat-1', name: 'Ana', cpf: 'encrypted:123', phone: null, email: null },
      ]);
      mockPrisma.patient.count.mockResolvedValue(1);

      const result = await service.list({ sub: 'psi-1', role: 'psychologist' }, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return patient with decrypted fields', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({
        id: 'pat-1',
        psychologistId: 'psi-1',
        userId: 'patient-user-1',
        cpf: 'encrypted:12345678901',
        phone: 'encrypted:(11) 99876-5432',
        email: 'encrypted:ana@email.com',
      });
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psi-1' });

      const result = await service.findOne('pat-1', { sub: 'psi-user-1', role: 'psychologist', psychologistId: 'psi-1' });

      expect(result.cpf).toBe('12345678901');
      expect(result.phone).toBe('(11) 99876-5432');
    });

    it('should throw NotFoundException when patient does not exist', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', { sub: 'psi-1', role: 'psychologist' }),
      ).rejects.toThrow('Paciente não encontrado');
    });
  });

  describe('createConsent', () => {
    it('should create consent and audit log', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({ id: 'pat-1', userId: 'user-1' });
      mockPrisma.consent.create.mockResolvedValue({ id: 'consent-1' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createConsent(
        'pat-1',
        { sub: 'user-1', role: 'patient' },
        { type: 'lgpd', version: '1.0', textSnapshot: 'Termo de consentimento...' },
      );

      expect(result.id).toBe('consent-1');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledOnce();
    });

    it('should throw NotFoundException when patient does not exist', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      await expect(
        service.createConsent('nonexistent', { sub: 'user-1', role: 'patient' }, {
          type: 'lgpd',
          version: '1.0',
          textSnapshot: 'Texto',
        }),
      ).rejects.toThrow('Paciente não encontrado');
    });
  });
});
