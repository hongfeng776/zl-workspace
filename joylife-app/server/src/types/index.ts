export interface IUser {
  id: number;
  nickname: string;
  phone: string;
  email?: string;
  password: string;
  avatar?: string;
  wechatOpenId?: string;
  alipayUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  nickname: string;
  phone: string;
  password: string;
  email?: string;
}

export interface ILoginRequest {
  account: string;
  password?: string;
  code?: string;
  loginType: 'password' | 'code';
}

export interface IThirdPartyLogin {
  provider: 'wechat' | 'alipay';
  code: string;
  nickname?: string;
  avatar?: string;
}

export interface IResetPasswordRequest {
  phone?: string;
  email?: string;
  code: string;
  newPassword: string;
}

export interface IAuthResult {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface IApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}
