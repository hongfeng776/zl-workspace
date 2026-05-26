export const PHONE_REGEX = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;

export const PHONE_VALIDATION_RULE = {
  pattern: PHONE_REGEX,
  message: '请输入正确的手机号',
};

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}
