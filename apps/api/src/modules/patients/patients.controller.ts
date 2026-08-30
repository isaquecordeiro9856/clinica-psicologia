import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ListPatientsDto } from './dto/list-patients.dto';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Get()
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Listar pacientes' })
  list(@CurrentUser() user: { sub: string; role: string }, @Query() q: ListPatientsDto) {
    return this.patients.list(user, q);
  }

  @Post()
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Criar paciente' })
  create(@CurrentUser() user: { sub: string; role: string }, @Body() dto: CreatePatientDto) {
    return this.patients.create(user, dto).then((data) => ({ data }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter paciente por ID' })
  getOne(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.patients.findOne(id, user as never).then((data) => ({ data }));
  }

  @Patch(':id')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Atualizar paciente' })
  update(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, user, dto).then((data) => ({ data }));
  }

  @Delete(':id')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Excluir paciente' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.patients.remove(id, user).then((data) => ({ data }));
  }

  @Get(':id/export')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Exportar dados do paciente (LGPD)' })
  export(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.patients.exportData(id, user);
  }

  @Post(':id/consents')
  @ApiOperation({ summary: 'Registrar consentimento LGPD' })
  createConsent(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: string },
    @Body() dto: CreateConsentDto,
  ) {
    return this.patients.createConsent(id, user as never, dto).then((data) => ({ data }));
  }
}
