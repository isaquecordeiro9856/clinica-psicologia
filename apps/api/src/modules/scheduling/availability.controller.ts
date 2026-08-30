import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { SchedulingService } from './scheduling.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { UpdateAvailabilityRulesDto } from './dto/availability-rules.dto';

@ApiTags('availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AvailabilityController {
  constructor(private svc: SchedulingService, private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar disponibilidade de horários' })
  get(@Query() q: AvailabilityQueryDto) {
    return this.svc.getAvailability(q).then((data) => ({ data }));
  }

  @Get('rules')
  @UseGuards(RolesGuard)
  @Roles('psychologist')
  @ApiOperation({ summary: 'Obter regras de disponibilidade' })
  rules(@CurrentUser() user: { sub: string }) {
    return this.prisma.availabilityRule.findMany({ where: { psychologistId: user.sub } }).then((data) => ({ data }));
  }

  @Put('rules')
  @UseGuards(RolesGuard)
  @Roles('psychologist')
  @ApiOperation({ summary: 'Atualizar regras de disponibilidade' })
  async upsertRules(@CurrentUser() user: { sub: string }, @Body() body: UpdateAvailabilityRulesDto) {
    await this.prisma.availabilityRule.deleteMany({ where: { psychologistId: user.sub } });
    const created = await this.prisma.availabilityRule.createMany({
      data: body.rules.map((r) => ({ psychologistId: user.sub, ...r })) as never,
    });
    return { data: created };
  }
}
