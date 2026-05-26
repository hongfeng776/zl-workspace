import { AppError } from '../middleware/errorHandler';

export async function sendSms(phone: string, message: string): Promise<void> {
  console.log(`[SMS Mock] 发送短信到 ${phone}: ${message}`);
}

export async function sendVerificationCodeSms(phone: string, code: string): Promise<void> {
  await sendSms(phone, `【晴景天气】您的验证码是：${code}，5分钟内有效。`);
}
