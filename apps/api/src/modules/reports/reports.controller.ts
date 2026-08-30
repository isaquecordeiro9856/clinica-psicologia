import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('dashboard')
  @Roles('psychologist', 'secretary')
  @ApiOperation({ summary: 'Estatísticas do dashboard' })
  dashboard(@CurrentUser() user: { sub: string; role: string }) {
    return this.reports.dashboard(user).then((data) => ({ data }));
  }

  @Get('financial')
  @Roles('psychologist')
  @ApiOperation({ summary: 'Relatório financeiro' })
  financial(@CurrentUser() user: { sub: string; role: string }, @Query() q: ReportQueryDto) {
    return this.reports.financial(user, q.from, q.to).then((data) => ({ data }));
  }

  @Get('occupancy')
  @Roles('psychologist')
  @ApiOperation({ summary: 'Relatório de ocupação' })
  occupancy(@CurrentUser() user: { sub: string; role: string }, @Query() q: ReportQueryDto) {
    return this.reports.occupancy(user, q.from, q.to).then((data) => ({ data }));
  }
}
