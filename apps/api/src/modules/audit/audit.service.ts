import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}
  list(q: { entityType?: string; entityId?: string; actorUserId?: string }) {
    const where: Record<string, unknown> = {};
    if (q.entityType) where.entityType = q.entityType;
    if (q.entityId) where.entityId = q.entityId;
    if (q.actorUserId) where.actorUserId = q.actorUserId;
    return this.prisma.auditLog.findMany({ where: where as never, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}
