import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TelegramNotificationProvider } from '../../infra/providers/notification/telegram-notification.provider';
import { BrevoEmailProvider } from '../../infra/providers/email/brevo-email.provider';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, TelegramNotificationProvider, BrevoEmailProvider],
})
export class NotificationsModule {}
