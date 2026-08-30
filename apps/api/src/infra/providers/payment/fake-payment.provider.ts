import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, PaymentChargeInput, PaymentChargeResult } from '../../../common/ports/providers';

@Injectable()
export class FakePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(FakePaymentProvider.name);

  async createCharge(input: PaymentChargeInput): Promise<PaymentChargeResult> {
    const txId = `pix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(`[FAKE PIX] Charge created: ${txId} | R$ ${input.amount}`);

    // Simula QR Code e copia e cola
    const qrCode = `00020126580014br.gov.bcb.pix0136${txId}5204000053039865404${input.amount.toFixed(2)}5802BR5913CLINICA PSI6009SAO PAULO62070503***6304`;
    const copyPaste = txId;

    return {
      txId,
      qrCode,
      copyPaste,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  async verifyWebhook(_payload: Buffer, _signature: string): Promise<boolean> {
    this.logger.log('[FAKE PIX] Webhook verified (always true in fake mode)');
    return true;
  }

  async refund(txId: string): Promise<{ success: boolean }> {
    this.logger.log(`[FAKE PIX] Refund processed: ${txId}`);
    return { success: true };
  }
}
