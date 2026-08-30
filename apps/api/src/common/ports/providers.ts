export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ id: string; success: boolean }>;
}

export interface PaymentChargeInput {
  amount: number;
  description: string;
  patientId: string;
  appointmentId?: string;
}

export interface PaymentChargeResult {
  txId: string;
  qrCode?: string;
  copyPaste?: string;
  expiresAt: string;
}

export interface PaymentProvider {
  createCharge(input: PaymentChargeInput): Promise<PaymentChargeResult>;
  verifyWebhook(payload: Buffer, signature: string): Promise<boolean>;
  refund(txId: string): Promise<{ success: boolean }>;
}

export interface NotificationInput {
  channel: 'email' | 'whatsapp' | 'sms';
  to: string;
  template: string;
  data: Record<string, unknown>;
}

export interface NotificationProvider {
  send(input: NotificationInput): Promise<{ id: string; success: boolean }>;
}
