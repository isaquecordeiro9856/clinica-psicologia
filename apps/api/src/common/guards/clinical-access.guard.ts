import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Bloqueia hard qualquer role !== psychologist de acessar prontuário.
 * Deve ser usado em ClinicalRecordsController.
 */
@Injectable()
export class ClinicalAccessGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role: string };
    if (user?.role !== 'psychologist') {
      throw new ForbiddenException('Acesso a prontuário restrito à psicóloga responsável');
    }
    return true;
  }
}
