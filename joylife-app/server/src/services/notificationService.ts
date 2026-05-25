export interface SendResult {
  success: boolean;
  code?: string;
  message: string;
}

const sceneMessages: Record<string, string> = {
  register: '注册验证',
  login: '登录验证',
  reset_password: '重置密码',
};

function formatSmsContent(phone: string, code: string, scene: string): string {
  return `【乐活生活】您的${sceneMessages[scene] || '验证'}验证码是 ${code}，有效期5分钟，请勿泄露。`;
}

function formatEmailContent(code: string, scene: string): { subject: string; body: string } {
  const sceneName = sceneMessages[scene] || '验证';
  return {
    subject: `【乐活生活】您的${sceneName}验证码`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">乐活生活</h1>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">您的${sceneName}验证码</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            您好，您正在进行${sceneName}操作，请使用以下验证码完成验证：
          </p>
          <div style="background: #f6ffed; border: 2px solid #52c41a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #52c41a; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #999; font-size: 14px;">
            验证码有效期为5分钟，请勿将此验证码泄露给他人。
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            此邮件由系统自动发送，请勿回复。
          </p>
        </div>
      </div>
    `,
  };
}

export const smsService = {
  async sendVerificationCode(phone: string, code: string, scene: string): Promise<SendResult> {
    const content = formatSmsContent(phone, code, scene);
    
    console.log('========================================');
    console.log(`📱 短信发送通知`);
    console.log(`----------------------------------------`);
    console.log(`手机号: ${phone}`);
    console.log(`验证码: ${code}`);
    console.log(`场景: ${sceneMessages[scene]}`);
    console.log(`内容: ${content}`);
    console.log(`状态: 已发送（模拟）`);
    console.log('========================================');
    
    return {
      success: true,
      code,
      message: '验证码已发送',
    };
  },

  async sendEmailCode(email: string, code: string, scene: string): Promise<SendResult> {
    const { subject, body } = formatEmailContent(code, scene);
    
    console.log('========================================');
    console.log(`📧 邮件发送通知`);
    console.log(`----------------------------------------`);
    console.log(`收件人: ${email}`);
    console.log(`验证码: ${code}`);
    console.log(`场景: ${sceneMessages[scene]}`);
    console.log(`主题: ${subject}`);
    console.log(`状态: 已发送（模拟）`);
    console.log('========================================');
    
    return {
      success: true,
      code,
      message: '验证码已发送',
    };
  },
};
