import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { SchedulingService } from './scheduling.service';

@ApiTags('availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AvailabilityController {
  constructor(private svc: SchedulingService, private prisma: PrismaService) {}

  @Get()
  get(@Query() q: { psychologistId: string; from: string; to: string }) {
    return this.svc.getAvailability(q).then((data) => ({ data }));
  }

  @Get('rules')
  @UseGuards(RolesGuard)
  @Roles('psychologist')
  rules(@CurrentUser() user: { sub: string }) {
    return this.prisma.availabilityRule.findMany({ where: { psychologistId: user.sub } }).then((data) => ({ data }));
  }

  @Put('rules')
  @UseGuards(RolesGuard)
  @Roles('psychologist')
  async upsertRules(@CurrentUser() user: { sub: string }, @Body() body: { rules: { weekday: number; startTime: string; endTime: string; slotDuration: number }[] }) {
    await this.prisma.availabilityRule.deleteMany({ where: { psychologistId: user.sub } });
    const created = await this.prisma.availabilityRule.createMany({
      data: body.rules.map((r) => ({ psychologistId: user.sub, ...r })) as never,
    });
    return { data: created };
  }
}
