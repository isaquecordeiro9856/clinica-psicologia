import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          // Fire-and-forget audit (não bloqueia resposta)
          if (url?.includes('clinical-records') || url?.includes('patients')) {
            this.prisma.auditLog
              .create({
                data: {
                  actorUserId: user?.sub ?? null,
                  actorRole: user?.role ?? null,
                  action: method === 'GET' ? 'view' : method.toLowerCase(),
                  entityType: url.includes('clinical-records') ? 'clinical_record' : 'patient',
                  entityId: req.params?.id ?? null,
                  ip: ip,
                  userAgent: headers?.['user-agent'] ?? null,
                },
              })
              .catch(() => {});
          }
        },
      }),
    );
  }
}
