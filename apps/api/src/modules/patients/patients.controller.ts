import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PatientsService } from './patients.service';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Get()
  @Roles('psychologist', 'secretary')
  list(@CurrentUser() user: { sub: string }, @Query() q: { page?: number; limit?: number }) {
    return this.patients.list(user.sub, q);
  }

  @Post()
  @Roles('psychologist', 'secretary')
  create(@CurrentUser() user: { sub: string }, @Body() dto: { name: string; cpf?: string; phone?: string; email?: string; birthDate?: string }) {
    return this.patients.create(user.sub, dto).then((data) => ({ data }));
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: { sub: string; role: string }) {
    return this.patients.findOne(id, user as never).then((data) => ({ data }));
  }

  @Get(':id/export')
  export(@Param('id') id: string) {
    return this.patients.exportData(id);
  }
}
