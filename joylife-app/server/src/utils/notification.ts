import { config } from '../config';

export async function sendSms(phone: string, code: string, template: string): Promise<boolean> {
  console.log(`[SMS Mock] 发送到 ${phone}: 验证码 ${code}, 模板: ${template}`);
  return true;
}

export async function sendEmail(to: string, subject: string, content: string): Promise<boolean> {
  console.log(`[EMAIL Mock] 发送到 ${to}: 主题: ${subject}`);
  console.log(`[EMAIL Mock] 内容: ${content}`);
  return true;
}

export async function sendVerificationCode(
  target: string,
  code: string,
  type: 'phone' | 'email',
  scene: 'register' | 'login' | 'reset_password'
): Promise<boolean> {
  const sceneText: Record<string, string> = {
    register: '注册',
    login: '登录',
    reset_password: '重置密码',
  };

  if (type === 'phone') {
    return sendSms(target, code, sceneText[scene]);
  } else {
    const subject = `【乐活生活】您的${sceneText[scene]}验证码`;
    const content = `您的验证码是 ${code}，有效期5分钟，请勿泄露。`;
    return sendEmail(target, subject, content);
  }
}
