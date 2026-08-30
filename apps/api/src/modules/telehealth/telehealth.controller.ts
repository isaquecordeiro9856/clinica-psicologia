import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TelehealthService } from './telehealth.service';

@ApiTags('Telehealth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('telehealth')
export class TelehealthController {
  constructor(private readonly svc: TelehealthService) {}

  @Post('rooms/:appointmentId')
  @ApiOperation({ summary: 'Criar sala de teleconsulta' })
  async createRoom(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.svc.createRoom(appointmentId, user);
  }

  @Post('sessions/:sessionId/end')
  @ApiOperation({ summary: 'Encerrar sessão de teleconsulta' })
  @Roles('psychologist')
  async endSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: string },
  ) {
    return this.svc.endSession(sessionId, user);
  }
}
