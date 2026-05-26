import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getSocialUrlHandler,
  socialCallbackHandler,
  bindSocialHandler,
  unbindSocialHandler,
  getSocialAccountsHandler,
} from '../controllers/socialController';

const router = Router();

router.get('/:provider/url', getSocialUrlHandler);
router.get('/:provider/callback', socialCallbackHandler);
router.get('/accounts', authMiddleware, getSocialAccountsHandler);
router.post('/:provider/bind', authMiddleware, bindSocialHandler);
router.delete('/:provider/unbind', authMiddleware, unbindSocialHandler);

export { router as socialRoutes };
