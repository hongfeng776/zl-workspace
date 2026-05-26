import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/auth';
import { AppError } from '../middleware/errorHandler';

export type SocialProvider = 'wechat' | 'qq' | 'weibo';

export interface SocialProfile {
  providerId: string;
  nickname?: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
}

export async function handleSocialLogin(
  provider: SocialProvider,
  profile: SocialProfile
): Promise<{ token: string; userId: string; isNewUser: boolean }> {
  let socialAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId: profile.providerId,
      },
    },
  });

  if (socialAccount) {
    await prisma.socialAccount.update({
      where: { id: socialAccount.id },
      data: {
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        nickname: profile.nickname,
        avatar: profile.avatar,
      },
    });

    const token = generateToken(socialAccount.userId);
    return { token, userId: socialAccount.userId, isNewUser: false };
  }

  const user = await prisma.user.create({
    data: {
      nickname: profile.nickname || `${provider}用户`,
      avatar: profile.avatar,
    },
  });

  await prisma.socialAccount.create({
    data: {
      provider,
      providerId: profile.providerId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      nickname: profile.nickname,
      avatar: profile.avatar,
      userId: user.id,
    },
  });

  const token = generateToken(user.id);
  return { token, userId: user.id, isNewUser: true };
}

export async function bindSocialAccount(
  userId: string,
  provider: SocialProvider,
  profile: SocialProfile
): Promise<void> {
  const existingBinding = await prisma.socialAccount.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId: profile.providerId,
      },
    },
  });

  if (existingBinding && existingBinding.userId !== userId) {
    throw new AppError('该社交账号已绑定其他用户', 400, 'ACCOUNT_ALREADY_BOUND');
  }

  if (existingBinding && existingBinding.userId === userId) {
    return;
  }

  const userHasProvider = await prisma.socialAccount.findFirst({
    where: { userId, provider },
  });

  if (userHasProvider) {
    throw new AppError('已绑定同类型社交账号', 400, 'PROVIDER_ALREADY_BOUND');
  }

  await prisma.socialAccount.create({
    data: {
      provider,
      providerId: profile.providerId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      nickname: profile.nickname,
      avatar: profile.avatar,
      userId,
    },
  });
}

export async function unbindSocialAccount(userId: string, provider: SocialProvider): Promise<void> {
  const binding = await prisma.socialAccount.findFirst({
    where: { userId, provider },
  });

  if (!binding) {
    throw new AppError('未绑定该社交账号', 404, 'BINDING_NOT_FOUND');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.phone && !user?.email) {
    const socialCount = await prisma.socialAccount.count({ where: { userId } });
    if (socialCount <= 1) {
      throw new AppError('至少保留一种登录方式', 400, 'CANNOT_UNBIND_LAST_METHOD');
    }
  }

  await prisma.socialAccount.delete({ where: { id: binding.id } });
}

export async function getUserSocialAccounts(userId: string) {
  return prisma.socialAccount.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      nickname: true,
      avatar: true,
      createdAt: true,
    },
  });
}

export function getSocialAuthUrl(provider: SocialProvider): string {
  const state = Math.random().toString(36).substring(7);

  switch (provider) {
    case 'wechat':
      return `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(process.env.WECHAT_REDIRECT_URI || '')}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    case 'qq':
      return `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${process.env.QQ_APP_ID}&redirect_uri=${encodeURIComponent(process.env.QQ_REDIRECT_URI || '')}&state=${state}`;
    case 'weibo':
      return `https://api.weibo.com/oauth2/authorize?client_id=${process.env.WEIBO_APP_KEY}&redirect_uri=${encodeURIComponent(process.env.WEIBO_REDIRECT_URI || '')}&response_type=code&state=${state}`;
    default:
      throw new AppError('不支持的登录方式', 400, 'UNSUPPORTED_PROVIDER');
  }
}
