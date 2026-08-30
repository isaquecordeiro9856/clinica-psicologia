import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is required (hex string, 64 chars)');
  }
  return Buffer.from(key, 'hex');
}

function getHmacPepper(): string {
  const pepper = process.env.ENCRYPTION_HMAC_PEPPER;
  if (!pepper) {
    throw new Error('ENCRYPTION_HMAC_PEPPER environment variable is required');
  }
  return pepper;
}

/**
 * Criptografia de campo AES-256-GCM com chave mestra (ENCRYPTION_MASTER_KEY hex 64 chars).
 * MVP: usa chave única. Fase 2: envelope com DEK por paciente.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // formato: iv:tag:ciphertext (base64)
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
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
  const pepper = getHmacPepper();
  return createHmac('sha256', pepper).update(value).digest('hex');
}

export function hashContent(content: string): string {
  const pepper = getHmacPepper();
  return createHmac('sha256', pepper).update(content).digest('hex');
}
