import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SchedulingService } from './scheduling.service';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SchedulingController {
  constructor(private svc: SchedulingService) {}

  @Get()
  list(@Query() q: Record<string, string>) {
    return this.svc.listAppointments(q).then((data) => ({ data }));
  }

  @Post()
  create(@Body() dto: { patientId: string; psychologistId: string; serviceId: string; startAt: string; endAt: string }) {
    return this.svc.createAppointment(dto).then((data) => ({ data }));
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.svc.cancel(id, body.reason).then((data) => ({ data }));
  }
}
