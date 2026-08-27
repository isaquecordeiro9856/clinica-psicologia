import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

/**
 * Criptografia de campo AES-256-GCM com chave mestra (ENCRYPTION_MASTER_KEY hex 64 chars).
 * MVP: usa chave única. Fase 2: envelope com DEK por paciente.
 */
export function encrypt(plaintext: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_MASTER_KEY ?? '0'.repeat(64), 'hex');
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // formato: iv:tag:ciphertext (base64)
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decrypt(ciphertext: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_MASTER_KEY ?? '0'.repeat(64), 'hex');
  const [ivB64, tagB64, dataB64] = ciphertext.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

export function hmac(value: string): string {
  const pepper = process.env.ENCRYPTION_HMAC_PEPPER ?? 'pepper-dev';
  return createHmac('sha256', pepper).update(value).digest('hex');
}

export function hashContent(content: string): string {
  return createHmac('sha256', 'audit').update(content).digest('hex');
}
