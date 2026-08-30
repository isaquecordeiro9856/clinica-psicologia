import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('psychologist', 'secretary')
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  list(@Query() q: { patientId?: string; status?: string }, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.list(q, user).then((data) => ({ data }));
  }

  @Post()
  @ApiOperation({ summary: 'Criar notificação' })
  enqueue(@Body() dto: CreateNotificationDto, @CurrentUser() user: { sub: string; role: string }) {
    return this.svc.enqueue(dto, user).then((data) => ({ data }));
  }
}
