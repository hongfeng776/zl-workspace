import { Request, Response, NextFunction } from 'express';
import { decodeToken } from '../utils/auth';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    nickname: string;
    phone: string;
    email?: string;
    avatar?: string;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 401, message: '无效的认证令牌' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    req.user = {
      id: user.id,
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: '认证失败' });
  }
}
