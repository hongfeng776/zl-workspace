import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `晴景天气 <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw new AppError('邮件发送失败', 500, 'EMAIL_SEND_FAILED');
  }
}

export async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  await sendEmail(
    to,
    '晴景天气 - 验证码',
    `您的验证码是：${code}，有效期为5分钟。请勿泄露给他人。`
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendEmail(
    to,
    '晴景天气 - 密码重置',
    `点击以下链接重置密码：${resetUrl}\n链接有效期为30分钟。`
  );
}
