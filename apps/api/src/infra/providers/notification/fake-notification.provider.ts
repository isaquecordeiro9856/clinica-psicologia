import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider, NotificationInput } from '../../../common/ports/providers';

@Injectable()
export class FakeNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(FakeNotificationProvider.name);

  async send(input: NotificationInput): Promise<{ id: string; success: boolean }> {
    const id = `notif-${Date.now()}`;
    this.logger.log(`[FAKE NOTIFICATION] Channel: ${input.channel} | Template: ${input.template} | To: ${input.to}`);
    return { id, success: true };
  }
}
