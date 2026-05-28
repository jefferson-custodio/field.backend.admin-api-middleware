import * as crypto from 'crypto';
import { CONFIG } from 'src/config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = CONFIG.security.cryptoSecret;

  if (!key) {
    throw new Error('CRYPTO_SECRET is missing in environment variables');
  }

  if (key.length !== 32) {
    throw new Error('CRYPTO_SECRET must be exactly 32 characters for AES-256');
  }

  return Buffer.from(key);
}

export function encrypt256(value: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(value, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return `${iv.toString('base64')}:${encrypted}`;
}

export function decrypt256(payload: string): string {
  const [ivStr, encrypted] = payload.split(':');

  const iv = Buffer.from(ivStr, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
