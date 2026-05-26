import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  handleSocialLogin,
  bindSocialAccount,
  unbindSocialAccount,
  getUserSocialAccounts,
  getSocialAuthUrl,
  SocialProvider,
  SocialProfile,
} from '../services/socialService';

export function getSocialUrlHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { provider } = req.params;
    if (!['wechat', 'qq', 'weibo'].includes(provider)) {
      res.status(400).json({ code: 'INVALID_PROVIDER', message: '不支持的登录方式' });
      return;
    }
    const url = getSocialAuthUrl(provider as SocialProvider);
    res.json({ code: 0, data: { url } });
  } catch (error) {
    next(error);
  }
}

export async function socialCallbackHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { provider } = req.params;
    const { code } = req.query;

    if (!['wechat', 'qq', 'weibo'].includes(provider)) {
      res.status(400).json({ code: 'INVALID_PROVIDER', message: '不支持的登录方式' });
      return;
    }

    const profile: SocialProfile = {
      providerId: `mock_${provider}_${code}`,
      nickname: `${provider}用户`,
      avatar: '',
      accessToken: code as string,
    };

    const result = await handleSocialLogin(provider as SocialProvider, profile);
    res.json({ code: 0, message: '登录成功', data: result });
  } catch (error) {
    next(error);
  }
}

export async function bindSocialHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { provider } = req.params;
    const { providerId, nickname, avatar, accessToken, refreshToken } = req.body;

    if (!['wechat', 'qq', 'weibo'].includes(provider)) {
      res.status(400).json({ code: 'INVALID_PROVIDER', message: '不支持的登录方式' });
      return;
    }

    if (!providerId) {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '缺少社交账号ID' });
      return;
    }

    await bindSocialAccount(userId, provider as SocialProvider, {
      providerId,
      nickname,
      avatar,
      accessToken,
      refreshToken,
    });

    res.json({ code: 0, message: '绑定成功' });
  } catch (error) {
    next(error);
  }
}

export async function unbindSocialHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { provider } = req.params;

    if (!['wechat', 'qq', 'weibo'].includes(provider)) {
      res.status(400).json({ code: 'INVALID_PROVIDER', message: '不支持的登录方式' });
      return;
    }

    await unbindSocialAccount(userId, provider as SocialProvider);
    res.json({ code: 0, message: '解绑成功' });
  } catch (error) {
    next(error);
  }
}

export async function getSocialAccountsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const accounts = await getUserSocialAccounts(userId);
    res.json({ code: 0, data: accounts });
  } catch (error) {
    next(error);
  }
}
