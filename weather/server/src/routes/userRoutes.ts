import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getProfileHandler,
  updateProfileHandler,
} from '../controllers/userController';

const router = Router();

router.get('/profile', authMiddleware, getProfileHandler);
router.put('/profile', authMiddleware, updateProfileHandler);

export { router as userRoutes };
