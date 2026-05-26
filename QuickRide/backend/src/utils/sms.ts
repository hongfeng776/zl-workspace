export function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function sendSmsCode(phone: string, code: string): boolean {
  console.log(`[模拟短信] 向手机号 ${phone} 发送验证码: ${code}`);
  return true;
}
