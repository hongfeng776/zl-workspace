export const PHONE_REGEX = /^1[3-9]\d{9}$/;

export const PHONE_VALIDATION_RULE = {
  pattern: PHONE_REGEX,
  message: '请输入正确的手机号',
};

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}
