import crypto from 'crypto';
import VerificationCode from '../models/VerificationCode';

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveVerificationCode(
  code: string,
  type: 'register' | 'login' | 'reset_password',
  phone?: string,
  email?: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  await VerificationCode.create({
    phone,
    email,
    code,
    type,
    expiresAt,
  });
}

export async function verifyCode(
  code: string,
  type: 'register' | 'login' | 'reset_password',
  phone?: string,
  email?: string
): Promise<boolean> {
  const now = new Date();
  const record = await VerificationCode.findOne({
    where: {
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      code,
      type,
      used: false,
    },
  });

  if (!record) {
    return false;
  }

  if (record.expiresAt < now) {
    return false;
  }

  await record.update({ used: true });
  return true;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number): string {
  const payload = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeToken(token: string): { userId: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
