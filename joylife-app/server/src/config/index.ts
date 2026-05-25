import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    name: process.env.DB_NAME || 'joylife',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'joylife-jwt-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'aliyun',
    accessKey: process.env.SMS_ACCESS_KEY || '',
    secret: process.env.SMS_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '乐活生活',
    templateCode: process.env.SMS_TEMPLATE_CODE || '',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
  },
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
  },
  alipay: {
    appid: process.env.ALIPAY_APPID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  },
};
