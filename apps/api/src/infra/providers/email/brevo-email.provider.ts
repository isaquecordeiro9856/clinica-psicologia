import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider, EmailOptions } from '../../../common/ports/providers';

@Injectable()
export class BrevoEmailProvider implements EmailProvider {
  private readonly logger = new Logger(BrevoEmailProvider.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY ?? '';
    this.fromEmail = process.env.EMAIL_FROM ?? 'noreply@clinica.app';
    this.fromName = process.env.BREVO_FROM_NAME ?? 'ClínicaPsi';
  }

  async send(options: EmailOptions): Promise<{ id: string; success: boolean }> {
    if (!this.apiKey || this.apiKey === 'CHANGE_ME') {
      this.logger.warn(`[BREVO] API key not configured. Email to ${options.to} not sent: ${options.subject}`);
      return { id: 'skipped', success: false };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: options.from ?? this.fromEmail, name: this.fromName },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`[BREVO] Failed to send email: ${response.status} - ${error}`);
        return { id: 'error', success: false };
      }

      const data = await response.json() as { messageId: string };
      this.logger.log(`[BREVO] Email sent to ${options.to}: ${options.subject}`);
      return { id: data.messageId ?? 'sent', success: true };
    } catch (error) {
      this.logger.error(`[BREVO] Error sending email: ${error}`);
      return { id: 'error', success: false };
    }
  }
}
