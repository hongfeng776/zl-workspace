import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getUserProfile, updateUserProfile } from '../services/userService';

export async function getProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const profile = await getUserProfile(userId);
    res.json({ code: 0, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { nickname, avatar, birthday, gender } = req.body;
    const updated = await updateUserProfile(userId, { nickname, avatar, birthday, gender });
    res.json({ code: 0, message: '资料更新成功', data: updated });
  } catch (error) {
    next(error);
  }
}
