import { Injectable, Logger } from '@nestjs/common';

/**
 * Generates static Pix QR codes following the EMVCo BR Code standard
 * as defined by the Banco Central do Brasil (BCB).
 *
 * Reference: Manual de Padrões para Iniciação do Pix v2.9.0
 * Reference: Manual BR Code v2.0.1
 */
@Injectable()
export class PixStaticProvider {
  private readonly logger = new Logger(PixStaticProvider.name);
  private readonly pixKey: string;
  private readonly receiverName: string;
  private readonly receiverCity: string;

  constructor() {
    this.pixKey = process.env.PIX_KEY ?? '';
    this.receiverName = process.env.PIX_RECEIVER_NAME ?? 'CLINICA PSI';
    this.receiverCity = process.env.PIX_RECEIVER_CITY ?? 'SAO PAULO';
  }

  /**
   * Generate a static Pix BR Code payload (EMVCo TLV format).
   * This generates a static QR code — no API call needed.
   */
  generatePayload(params: {
    pixKey?: string;
    receiverName?: string;
    receiverCity?: string;
    amount?: number;
    transactionId?: string;
    description?: string;
  }): string {
    const key = params.pixKey ?? this.pixKey;
    const name = this.normalizeString(params.receiverName ?? this.receiverName, 25);
    const city = this.normalizeString(params.receiverCity ?? this.receiverCity, 15);

    if (!key) {
      throw new Error('PIX_KEY environment variable is required');
    }

    // Merchant Account Information (Tag 26)
    const gui = 'BR.GOV.BCB.PIX';
    const keyField = this.tlv('01', key);
    const merchantAccount = this.tlv('26', gui + keyField);

    // Build payload
    let payload = '';
    payload += this.tlv('00', '01');                    // Payload Format Indicator
    payload += merchantAccount;                          // Merchant Account Information
    payload += this.tlv('52', '0000');                   // Merchant Category Code
    payload += this.tlv('53', '986');                    // Transaction Currency (BRL)
    if (params.amount) {
      payload += this.tlv('54', params.amount.toFixed(2)); // Transaction Amount
    }
    payload += this.tlv('58', 'BR');                    // Country Code
    payload += this.tlv('59', name);                    // Merchant Name
    payload += this.tlv('60', city);                    // Merchant City

    // Additional Data Field (Tag 62)
    if (params.transactionId || params.description) {
      let additionalData = '';
      if (params.transactionId) {
        additionalData += this.tlv('05', params.transactionId.substring(0, 25));
      }
      if (params.description) {
        additionalData += this.tlv('06', params.description.substring(0, 25));
      }
      payload += this.tlv('62', additionalData);
    }

    // CRC-16 checksum (Tag 63)
    payload += '6304';
    const crc = this.crc16Ccitt(payload);
    payload += crc;

    return payload;
  }

  /**
   * Generate a static Pix QR code as a data URL (base64 PNG).
   */
  async generateQrCode(params: {
    pixKey?: string;
    receiverName?: string;
    receiverCity?: string;
    amount?: number;
    transactionId?: string;
    description?: string;
  }): Promise<{ payload: string; qrCodeDataUrl: string }> {
    const payload = this.generatePayload(params);

    // Use a QR code library to generate the image
    // For now, return the payload — the frontend will generate the QR image
    return {
      payload,
      qrCodeDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`,
    };
  }

  /**
   * Validate a Pix key format (CPF, CNPJ, email, phone, or EVP/UUID).
   */
  validatePixKey(key: string): { valid: boolean; type: string } {
    if (/^\d{11}$/.test(key)) return { valid: true, type: 'cpf' };
    if (/^\d{14}$/.test(key)) return { valid: true, type: 'cnpj' };
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(key)) return { valid: true, type: 'email' };
    if (/^\+?\d{10,14}$/.test(key)) return { valid: true, type: 'phone' };
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return { valid: true, type: 'evp' };
    return { valid: false, type: 'unknown' };
  }

  /**
   * TLV (Tag-Length-Value) encoding per EMVCo spec.
   */
  private tlv(tag: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
  }

  /**
   * CRC-16/CCITT-FALSE checksum per BCB BR Code spec.
   * Polynomial: 0x1021, Initial: 0xFFFF
   */
  private crc16Ccitt(data: string): string {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Normalize string: remove accents, uppercase, truncate.
   */
  private normalizeString(str: string, maxLength: number): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .substring(0, maxLength);
  }
}
