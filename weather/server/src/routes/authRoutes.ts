import { Router } from 'express';
import {
  sendCodeHandler,
  registerHandler,
  loginHandler,
  requestResetHandler,
  resetPasswordHandler,
} from '../controllers/authController';

const router = Router();

router.post('/send-code', sendCodeHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/request-reset', requestResetHandler);
router.post('/reset-password', resetPasswordHandler);

export { router as authRoutes };
