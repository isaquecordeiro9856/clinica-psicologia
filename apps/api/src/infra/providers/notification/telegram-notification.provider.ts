import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider, NotificationInput } from '../../../common/ports/providers';

@Injectable()
export class TelegramNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(TelegramNotificationProvider.name);
  private readonly botToken: string;
  private readonly baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN ?? '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async send(input: NotificationInput): Promise<{ id: string; success: boolean }> {
    if (!this.botToken || this.botToken === 'CHANGE_ME') {
      this.logger.warn(`[TELEGRAM] Bot token not configured. Message to ${input.to} not sent.`);
      return { id: 'skipped', success: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: input.to,
          text: input.template,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`[TELEGRAM] Failed to send message: ${response.status} - ${error}`);
        return { id: 'error', success: false };
      }

      const data = await response.json() as { result: { message_id: number } };
      this.logger.log(`[TELEGRAM] Message sent to chat ${input.to}`);
      return { id: String(data.result?.message_id ?? 'sent'), success: true };
    } catch (error) {
      this.logger.error(`[TELEGRAM] Error sending message: ${error}`);
      return { id: 'error', success: false };
    }
  }
}
