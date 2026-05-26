const SMS_CONFIG = {
  CODE_LENGTH: 4,
  MIN_VALUE: 1000,
  MAX_VALUE: 9999,
  EXPIRY_MINUTES: 5,
  RATE_LIMIT_SECONDS: 60,
  DAILY_LIMIT: 10
};

interface SmsRateLimit {
  [phone: string]: {
    count: number;
    lastSent: number;
    lastReset: number;
  };
}

const rateLimitStore: SmsRateLimit = {};

function ensure4Digits(num: number): string {
  return num.toString().padStart(4, '0').slice(-4);
}

export function generateCode(): string {
  const min = SMS_CONFIG.MIN_VALUE;
  const max = SMS_CONFIG.MAX_VALUE;
  const code = Math.floor(min + Math.random() * (max - min + 1));
  const result = ensure4Digits(code);
  
  if (result.length !== 4 || isNaN(parseInt(result))) {
    console.warn('[验证码] 生成异常，重新生成:', result);
    return generateCode();
  }
  
  return result;
}

export function checkRateLimit(phone: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const record = rateLimitStore[phone];
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  if (!record || now - record.lastReset > 86400000) {
    rateLimitStore[phone] = {
      count: 1,
      lastSent: now,
      lastReset: todayStart.getTime()
    };
    return { allowed: true };
  }
  
  if (now - record.lastSent < SMS_CONFIG.RATE_LIMIT_SECONDS * 1000) {
    const waitTime = Math.ceil((SMS_CONFIG.RATE_LIMIT_SECONDS * 1000 - (now - record.lastSent)) / 1000);
    return {
      allowed: false,
      message: `发送过于频繁，请${waitTime}秒后再试`
    };
  }
  
  if (record.count >= SMS_CONFIG.DAILY_LIMIT) {
    return {
      allowed: false,
      message: '今日发送次数已达上限，请明天再试'
    };
  }
  
  record.count++;
  record.lastSent = now;
  
  return { allowed: true };
}

export function sendSmsCode(phone: string, code: string): { success: boolean; message: string } {
  if (code.length !== 4) {
    console.error('[短信] 验证码长度错误:', code);
    return { success: false, message: '验证码格式错误' };
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    console.error('[短信] 手机号格式错误:', phone);
    return { success: false, message: '手机号格式错误' };
  }
  
  console.log(`========================================`);
  console.log(`[模拟短信] 发送时间: ${new Date().toLocaleString()}`);
  console.log(`[模拟短信] 接收手机号: ${phone}`);
  console.log(`[模拟短信] 验证码: ${code}`);
  console.log(`[模拟短信] 有效期: ${SMS_CONFIG.EXPIRY_MINUTES}分钟`);
  console.log(`========================================`);
  
  return { success: true, message: '短信发送成功' };
}

export { SMS_CONFIG };
