import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ClinicalAccessGuard } from '../../common/guards/clinical-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClinicalRecordsService } from './clinical-records.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from './dto/update-clinical-record.dto';

@ApiTags('clinical-records')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, ClinicalAccessGuard)
@Roles('psychologist')
@ApiBearerAuth('access-token')
export class ClinicalRecordsController {
  constructor(private svc: ClinicalRecordsService) {}

  @Get('patients/:id/clinical-records')
  @ApiOperation({ summary: 'Listar prontuários do paciente' })
  list(@Param('id') patientId: string, @CurrentUser() user: { sub: string }) {
    return this.svc.list(patientId, user.sub).then((data) => ({ data }));
  }

  @Post('patients/:id/clinical-records')
  @ApiOperation({ summary: 'Criar registro de prontuário' })
  create(@Param('id') patientId: string, @CurrentUser() user: { sub: string }, @Body() dto: CreateClinicalRecordDto) {
    return this.svc.create(patientId, user.sub, dto).then((data) => ({ data }));
  }

  @Get('clinical-records/:id')
  @ApiOperation({ summary: 'Obter prontuário por ID' })
  getOne(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.svc.getOne(id, user.sub).then((data) => ({ data }));
  }

  @Put('clinical-records/:id')
  @ApiOperation({ summary: 'Atualizar registro de prontuário' })
  update(@Param('id') id: string, @CurrentUser() user: { sub: string }, @Body() dto: UpdateClinicalRecordDto) {
    return this.svc.update(id, user.sub, dto).then((data) => ({ data }));
  }

  @Delete('clinical-records/:id')
  @ApiOperation({ summary: 'Excluir registro de prontuário' })
  remove(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.svc.remove(id, user.sub).then((data) => ({ data }));
  }
}
