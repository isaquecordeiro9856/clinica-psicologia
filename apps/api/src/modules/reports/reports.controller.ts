import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('psychologist')
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('financial')
  financial(@CurrentUser() user: { sub: string }, @Query() q: { from: string; to: string }) {
    return this.reports.financial(user.sub, q.from, q.to).then((data) => ({ data }));
  }

  @Get('occupancy')
  occupancy(@CurrentUser() user: { sub: string }, @Query() q: { from: string; to: string }) {
    return this.reports.occupancy(user.sub, q.from, q.to).then((data) => ({ data }));
  }
}
