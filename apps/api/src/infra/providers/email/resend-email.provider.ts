import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider, EmailOptions } from '../../../common/ports/providers';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly apiKey: string;
  private readonly from: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY ?? '';
    this.from = process.env.EMAIL_FROM ?? 'noreply@clinica.app';
  }

  async send(options: EmailOptions): Promise<{ id: string; success: boolean }> {
    if (!this.apiKey || this.apiKey === 're_xxx') {
      this.logger.warn('Resend API key not configured, falling back to fake provider');
      return { id: `email-fallback-${Date.now()}`, success: true };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from ?? this.from,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const data = await res.json();
      this.logger.log(`Email sent via Resend: ${data.id}`);
      return { id: data.id, success: true };
    } catch (error) {
      this.logger.error(`Failed to send email via Resend: ${(error as Error).message}`);
      throw error;
    }
  }
}
