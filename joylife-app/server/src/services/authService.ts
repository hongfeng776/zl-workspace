import User from '../models/User';
import { ICreateUser, IAuthResult, ILoginRequest, IThirdPartyLogin, IResetPasswordRequest } from '../types';
import { hashPassword, comparePassword, generateToken, generateVerificationCode, saveVerificationCode, verifyCode } from '../utils/auth';
import { sendVerificationCode } from '../utils/notification';

export const authService = {
  async register(data: ICreateUser): Promise<IAuthResult> {
    const existingUser = await User.findOne({ where: { phone: data.phone } });
    if (existingUser) {
      throw new Error('该手机号已注册');
    }

    if (data.email) {
      const existingEmail = await User.findOne({ where: { email: data.email } });
      if (existingEmail) {
        throw new Error('该邮箱已被使用');
      }
    }

    const user = await User.create({
      nickname: data.nickname,
      phone: data.phone,
      email: data.email,
      password: hashPassword(data.password),
    });

    const token = generateToken(user.id);
    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
        alipayUserId: user.alipayUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  },

  async login(data: ILoginRequest): Promise<IAuthResult> {
    const { account, loginType } = data;
    const user = await User.findOne({
      where: loginType === 'code' ? { phone: account } : undefined,
    });

    if (!user && loginType === 'password') {
      const found = await User.findOne({
        where: { phone: account },
      });
      if (!found) {
        throw new Error('用户不存在');
      }
      if (!comparePassword(data.password!, found.password)) {
        throw new Error('密码错误');
      }
      return {
        user: {
          id: found.id,
          nickname: found.nickname,
          phone: found.phone,
          email: found.email,
          avatar: found.avatar,
          wechatOpenId: found.wechatOpenId,
          alipayUserId: found.alipayUserId,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
        },
        token: generateToken(found.id),
      };
    }

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
        alipayUserId: user.alipayUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: generateToken(user.id),
    };
  },

  async sendCode(phone: string, type: 'register' | 'login' | 'reset_password'): Promise<void> {
    const existingUser = await User.findOne({ where: { phone } });
    if (type === 'register' && existingUser) {
      throw new Error('该手机号已注册');
    }
    if (type !== 'register' && !existingUser) {
      throw new Error('该手机号未注册');
    }

    const code = generateVerificationCode();
    await saveVerificationCode(code, type, phone);
    await sendVerificationCode(phone, code, 'phone', type);
  },

  async sendEmailCode(email: string, type: 'register' | 'login' | 'reset_password'): Promise<void> {
    const existingUser = await User.findOne({ where: { email } });
    if (type === 'register' && existingUser) {
      throw new Error('该邮箱已被使用');
    }
    if (type !== 'register' && !existingUser) {
      throw new Error('该邮箱未注册');
    }

    const code = generateVerificationCode();
    await saveVerificationCode(code, type, undefined, email);
    await sendVerificationCode(email, code, 'email', type);
  },

  async resetPassword(data: IResetPasswordRequest): Promise<void> {
    let user: User | null = null;

    if (data.phone) {
      user = await User.findOne({ where: { phone: data.phone } });
    } else if (data.email) {
      user = await User.findOne({ where: { email: data.email } });
    }

    if (!user) {
      throw new Error('用户不存在');
    }

    const isValid = await verifyCode(data.code, 'reset_password', data.phone, data.email);
    if (!isValid) {
      throw new Error('验证码错误或已过期');
    }

    await user.update({ password: hashPassword(data.newPassword) });
  },

  async thirdPartyLogin(data: IThirdPartyLogin): Promise<IAuthResult> {
    const { provider, code, nickname, avatar } = data;

    let user: User | null = null;

    if (provider === 'wechat') {
      const mockOpenId = `wx_${code}_${Date.now()}`;
      user = await User.findOne({ where: { wechatOpenId: mockOpenId } });
      if (!user) {
        user = await User.create({
          nickname: nickname || `微信用户${Date.now().toString().slice(-6)}`,
          phone: `wx_${Date.now().toString().slice(-11)}`,
          password: hashPassword('third_party_default'),
          wechatOpenId: mockOpenId,
          avatar,
        });
      }
    } else if (provider === 'alipay') {
      const mockUserId = `alipay_${code}_${Date.now()}`;
      user = await User.findOne({ where: { alipayUserId: mockUserId } });
      if (!user) {
        user = await User.create({
          nickname: nickname || `支付宝用户${Date.now().toString().slice(-6)}`,
          phone: `ali_${Date.now().toString().slice(-11)}`,
          password: hashPassword('third_party_default'),
          alipayUserId: mockUserId,
          avatar,
        });
      }
    }

    if (!user) {
      throw new Error('第三方登录失败');
    }

    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
        alipayUserId: user.alipayUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: generateToken(user.id),
    };
  },

  async bindThirdParty(
    userId: number,
    provider: 'wechat' | 'alipay',
    code: string
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (provider === 'wechat') {
      await user.update({ wechatOpenId: `wx_${code}_${Date.now()}` });
    } else {
      await user.update({ alipayUserId: `alipay_${code}_${Date.now()}` });
    }
  },

  async getProfile(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      wechatOpenId: user.wechatOpenId,
      alipayUserId: user.alipayUserId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
