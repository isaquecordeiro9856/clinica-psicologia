import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SchedulingService } from './scheduling.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SchedulingController {
  constructor(private svc: SchedulingService) {}

  @Get('services')
  @Roles('psychologist', 'secretary')
  services(@CurrentUser() user: { sub: string; role: string }) {
    return this.svc.listServices(user).then((data) => ({ data }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar consulta por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.findOne(id, user).then((data) => ({ data }));
  }

  @Delete(':id')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Remover agendamento cancelado' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.remove(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar consultas' })
  list(@CurrentUser() user: { sub: string; role: string }, @Query() q: ListAppointmentsDto) {
    // listAppointments already returns the API envelope: { data, meta }.
    // Wrapping it again produces { data: { data, meta } } and breaks clients
    // that consume the appointment list as an array.
    return this.svc.listAppointments(q, user);
  }

  @Post()
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Criar consulta' })
  create(
    @CurrentUser() user: { sub: string; role: string },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.svc.createAppointment(dto, user).then((data) => ({ data }));
  }

  @Patch(':id/cancel')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Cancelar consulta' })
  cancel(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }, @Body() body: CancelAppointmentDto) {
    return this.svc.cancel(id, user, body.reason).then((data) => ({ data }));
  }

  @Patch(':id/reschedule')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Reagendar consulta' })
  reschedule(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }, @Body() body: RescheduleAppointmentDto) {
    return this.svc.reschedule(id, user, body.startAt, body.endAt).then((data) => ({ data }));
  }

  @Patch(':id/confirm')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Confirmar consulta' })
  confirm(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.confirm(id, user).then((data) => ({ data }));
  }

  @Patch(':id/complete')
  @Roles('psychologist')
  @ApiOperation({ summary: 'Marcar como realizada' })
  complete(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.complete(id, user).then((data) => ({ data }));
  }

  @Patch(':id/no-show')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Marcar como não compareceu' })
  noShow(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.noShow(id, user).then((data) => ({ data }));
  }
}
