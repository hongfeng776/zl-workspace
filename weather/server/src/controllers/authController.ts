import { Request, Response, NextFunction } from 'express';
import {
  sendVerificationCode,
  registerWithPhone,
  loginWithPhone,
  loginWithSmsCode,
  requestPasswordReset,
  resetPasswordWithCode,
  resetPasswordWithToken,
} from '../services/authService';

export async function sendCodeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { target, type } = req.body;
    if (!target || !type) {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '缺少必要参数' });
      return;
    }
    if (type !== 'phone' && type !== 'email') {
      res.status(400).json({ code: 'INVALID_TYPE', message: '无效的验证类型' });
      return;
    }
    await sendVerificationCode(target, type);
    res.json({ code: 0, message: '验证码已发送' });
  } catch (error) {
    next(error);
  }
}

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, code, password } = req.body;
    if (!phone || !code || !password) {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '缺少必要参数' });
      return;
    }
    if (password.length < 6 || password.length > 20) {
      res.status(400).json({ code: 'INVALID_PASSWORD', message: '密码长度需在6-20位之间' });
      return;
    }
    const result = await registerWithPhone(phone, code, password);
    res.json({ code: 0, message: '注册成功', data: result });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, password, code } = req.body;
    if (!phone) {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '缺少手机号' });
      return;
    }

    let result;
    if (code) {
      result = await loginWithSmsCode(phone, code);
    } else if (password) {
      result = await loginWithPhone(phone, password);
    } else {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '请输入密码或验证码' });
      return;
    }

    res.json({ code: 0, message: '登录成功', data: result });
  } catch (error) {
    next(error);
  }
}

export async function requestResetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { target, type } = req.body;
    if (!target || !type) {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '缺少必要参数' });
      return;
    }
    await requestPasswordReset(target, type);
    res.json({ code: 0, message: '重置验证码已发送' });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { target, code, token, newPassword, type } = req.body;
    if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
      res.status(400).json({ code: 'INVALID_PASSWORD', message: '密码长度需在6-20位之间' });
      return;
    }

    if (token) {
      await resetPasswordWithToken(token, newPassword);
    } else if (target && code && type) {
      await resetPasswordWithCode(target, code, newPassword, type);
    } else {
      res.status(400).json({ code: 'MISSING_PARAMS', message: '缺少必要参数' });
      return;
    }

    res.json({ code: 0, message: '密码重置成功' });
  } catch (error) {
    next(error);
  }
}
