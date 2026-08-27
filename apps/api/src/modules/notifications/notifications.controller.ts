import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  list(@Query() q: Record<string, string>) {
    return this.svc.list(q).then((data) => ({ data }));
  }

  @Post()
  enqueue(@Body() dto: { patientId: string; appointmentId?: string; channel: string; template: string }) {
    return this.svc.enqueue(dto).then((data) => ({ data }));
  }
}
