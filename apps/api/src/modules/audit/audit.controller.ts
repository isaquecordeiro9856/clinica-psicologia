import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('psychologist', 'admin')
@ApiBearerAuth('access-token')
export class AuditController {
  constructor(private audit: AuditService) {}
  @Get()
  list(@Query() q: { entityType?: string; entityId?: string }) {
    return this.audit.list(q).then((data) => ({ data }));
  }
}
