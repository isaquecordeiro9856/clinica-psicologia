import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider, EmailOptions } from '../../../common/ports/providers';

@Injectable()
export class FakeEmailProvider implements EmailProvider {
  private readonly logger = new Logger(FakeEmailProvider.name);

  async send(options: EmailOptions): Promise<{ id: string; success: boolean }> {
    const id = `email-${Date.now()}`;
    this.logger.log(`[FAKE EMAIL] To: ${options.to} | Subject: ${options.subject}`);
    this.logger.debug(`[FAKE EMAIL] Body: ${options.html.slice(0, 100)}...`);
    return { id, success: true };
  }
}
