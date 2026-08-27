import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ClinicalAccessGuard } from '../../common/guards/clinical-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClinicalRecordsService } from './clinical-records.service';

@ApiTags('clinical-records')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, ClinicalAccessGuard)
@Roles('psychologist')
@ApiBearerAuth('access-token')
export class ClinicalRecordsController {
  constructor(private svc: ClinicalRecordsService) {}

  @Get('patients/:id/clinical-records')
  list(@Param('id') patientId: string, @CurrentUser() user: { sub: string }) {
    return this.svc.list(patientId, user.sub).then((data) => ({ data }));
  }

  @Post('patients/:id/clinical-records')
  create(@Param('id') patientId: string, @CurrentUser() user: { sub: string }, @Body() dto: { content: string; appointmentId?: string; type?: string }) {
    return this.svc.create(patientId, user.sub, dto).then((data) => ({ data }));
  }

  @Get('clinical-records/:id')
  getOne(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.svc.getOne(id, user.sub).then((data) => ({ data }));
  }
}
