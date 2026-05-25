import request, { ApiResponse } from './request';

export interface RegisterParams {
  nickname: string;
  phone: string;
  password: string;
  email?: string;
  code: string;
}

export interface LoginParams {
  account: string;
  password?: string;
  code?: string;
  loginType: 'password' | 'code';
}

export interface ThirdPartyLoginParams {
  provider: 'wechat' | 'alipay';
  code: string;
  nickname?: string;
  avatar?: string;
}

export interface ResetPasswordParams {
  phone?: string;
  email?: string;
  code: string;
  newPassword: string;
}

export interface SendCodeParams {
  phone?: string;
  email?: string;
  type: 'register' | 'login' | 'reset_password';
}

export interface UserInfo {
  id: number;
  nickname: string;
  phone: string;
  email?: string;
  avatar?: string;
  wechatOpenId?: string;
  alipayUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: UserInfo;
  token: string;
}

export const authApi = {
  register: (data: RegisterParams) =>
    request.post<ApiResponse<AuthResult>>('/auth/register', data),

  login: (data: LoginParams) =>
    request.post<ApiResponse<AuthResult>>('/auth/login', data),

  sendCode: (data: SendCodeParams) =>
    request.post<ApiResponse>('/auth/send-code', data),

  resetPassword: (data: ResetPasswordParams) =>
    request.post<ApiResponse>('/auth/reset-password', data),

  thirdPartyLogin: (data: ThirdPartyLoginParams) =>
    request.post<ApiResponse<AuthResult>>('/auth/third-party-login', data),

  bindThirdParty: (data: { provider: 'wechat' | 'alipay'; code: string }) =>
    request.post<ApiResponse>('/auth/bind-third-party', data),

  getProfile: () =>
    request.get<ApiResponse<UserInfo>>('/auth/profile'),

  logout: () =>
    request.post<ApiResponse>('/auth/logout'),
};
