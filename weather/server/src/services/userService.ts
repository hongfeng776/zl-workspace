import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface UpdateProfileData {
  nickname?: string;
  avatar?: string;
  birthday?: string;
  gender?: string;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      email: true,
      nickname: true,
      avatar: true,
      birthday: true,
      gender: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
  }

  return {
    ...user,
    phone: user.phone ? maskPhone(user.phone) : null,
    email: user.email ? maskEmail(user.email) : null,
  };
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
) {
  const updateData: Record<string, unknown> = {};

  if (data.nickname !== undefined) {
    if (data.nickname.length < 2 || data.nickname.length > 20) {
      throw new AppError('昵称长度需在2-20个字符之间', 400, 'INVALID_NICKNAME');
    }
    updateData.nickname = data.nickname;
  }

  if (data.avatar !== undefined) {
    updateData.avatar = data.avatar;
  }

  if (data.birthday !== undefined) {
    updateData.birthday = data.birthday ? new Date(data.birthday) : null;
  }

  if (data.gender !== undefined) {
    if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
      throw new AppError('性别参数无效', 400, 'INVALID_GENDER');
    }
    updateData.gender = data.gender;
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      nickname: true,
      avatar: true,
      birthday: true,
      gender: true,
      updatedAt: true,
    },
  });
}

export async function bindPhone(userId: string, phone: string, code: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({ where: { phone } });
  if (existingUser && existingUser.id !== userId) {
    throw new AppError('该手机号已被其他账号绑定', 400, 'PHONE_ALREADY_BOUND');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.phone) {
    throw new AppError('当前账号已绑定手机号', 400, 'PHONE_ALREADY_BOUND_SELF');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { phone },
  });
}

export async function bindEmail(userId: string, email: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== userId) {
    throw new AppError('该邮箱已被其他账号绑定', 400, 'EMAIL_ALREADY_BOUND');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email) {
    throw new AppError('当前账号已绑定邮箱', 400, 'EMAIL_ALREADY_BOUND_SELF');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email },
  });
}

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}*@${domain}`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}
