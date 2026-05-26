import { prisma } from '../lib/prisma';
import {
  generateToken,
  hashPassword,
  comparePassword,
  generateVerificationCode,
  isCodeExpired,
  generateResetToken,
} from '../lib/auth';
import { AppError } from '../middleware/errorHandler';
import { sendVerificationCodeSms } from './smsService';
import { sendVerificationCodeEmail, sendPasswordResetEmail } from './emailService';

export async function sendVerificationCode(target: string, type: 'phone' | 'email'): Promise<void> {
  const existingUser = type === 'phone'
    ? await prisma.user.findUnique({ where: { phone: target } })
    : await prisma.user.findUnique({ where: { email: target } });

  if (existingUser && type === 'phone') {
    throw new AppError('该手机号已注册', 400, 'PHONE_ALREADY_REGISTERED');
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.verificationCode.create({
    data: {
      target,
      code,
      type,
      expiresAt,
    },
  });

  if (type === 'phone') {
    await sendVerificationCodeSms(target, code);
  } else {
    await sendVerificationCodeEmail(target, code);
  }
}

export async function verifyCode(target: string, code: string, type: 'phone' | 'email'): Promise<boolean> {
  const record = await prisma.verificationCode.findFirst({
    where: {
      target,
      code,
      type,
      used: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return false;
  }

  if (isCodeExpired(record.expiresAt)) {
    return false;
  }

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return true;
}

export async function registerWithPhone(
  phone: string,
  code: string,
  password: string
): Promise<{ token: string; userId: string }> {
  const isValid = await verifyCode(phone, code, 'phone');
  if (!isValid) {
    throw new AppError('验证码无效或已过期', 400, 'INVALID_CODE');
  }

  const existingUser = await prisma.user.findUnique({ where: { phone } });
  if (existingUser) {
    throw new AppError('该手机号已注册', 400, 'PHONE_ALREADY_REGISTERED');
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      phone,
      password: hashedPassword,
      nickname: `用户${phone.slice(-4)}`,
    },
  });

  const token = generateToken(user.id);
  return { token, userId: user.id };
}

export async function loginWithPhone(
  phone: string,
  password: string
): Promise<{ token: string; userId: string }> {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.password) {
    throw new AppError('手机号或密码错误', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new AppError('手机号或密码错误', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user.id);
  return { token, userId: user.id };
}

export async function loginWithSmsCode(
  phone: string,
  code: string
): Promise<{ token: string; userId: string }> {
  const isValid = await verifyCode(phone, code, 'phone');
  if (!isValid) {
    throw new AppError('验证码无效或已过期', 400, 'INVALID_CODE');
  }

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        nickname: `用户${phone.slice(-4)}`,
      },
    });
  }

  const token = generateToken(user.id);
  return { token, userId: user.id };
}

export async function requestPasswordReset(target: string, type: 'phone' | 'email'): Promise<void> {
  const user = type === 'phone'
    ? await prisma.user.findUnique({ where: { phone: target } })
    : await prisma.user.findUnique({ where: { email: target } });

  if (!user) {
    throw new AppError('该账号不存在', 404, 'USER_NOT_FOUND');
  }

  if (type === 'phone') {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.verificationCode.create({
      data: { target, code, type: 'phone_reset', expiresAt },
    });
    await sendVerificationCodeSms(target, code);
  } else {
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: resetToken, expiresAt },
    });
    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(target, resetUrl);
  }
}

export async function resetPasswordWithCode(
  target: string,
  code: string,
  newPassword: string,
  type: 'phone' | 'email'
): Promise<void> {
  const isValid = await verifyCode(target, code, type === 'phone' ? 'phone_reset' : 'email_reset');
  if (!isValid) {
    throw new AppError('验证码无效或已过期', 400, 'INVALID_CODE');
  }

  const user = type === 'phone'
    ? await prisma.user.findUnique({ where: { phone: target } })
    : await prisma.user.findUnique({ where: { email: target } });

  if (!user) {
    throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.used || isCodeExpired(record.expiresAt)) {
    throw new AppError('重置链接无效或已过期', 400, 'INVALID_RESET_TOKEN');
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { used: true },
  });
}
