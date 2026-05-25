import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { nickname, phone, password, email, code } = req.body;

    if (!nickname || !phone || !password || !code) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 400, message: '手机号格式错误' });
    }

    if (password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
    }

    const { verifyCode } = require('../utils/auth');
    const isValid = await verifyCode(code, 'register', phone);
    if (!isValid) {
      return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
    }

    const result = await authService.register({ nickname, phone, password, email });
    res.json({ code: 200, message: '注册成功', data: result });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '注册失败' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { account, password, code, loginType } = req.body;

    if (!account || !loginType) {
      return res.status(400).json({ code: 400, message: '请填写登录信息' });
    }

    if (loginType === 'password' && !password) {
      return res.status(400).json({ code: 400, message: '请输入密码' });
    }

    if (loginType === 'code' && !code) {
      return res.status(400).json({ code: 400, message: '请输入验证码' });
    }

    if (loginType === 'code') {
      const { verifyCode } = require('../utils/auth');
      const isValid = await verifyCode(code, 'login', account);
      if (!isValid) {
        return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
      }
    }

    const result = await authService.login({ account, password, code, loginType });
    res.json({ code: 200, message: '登录成功', data: result });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '登录失败' });
  }
});

router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phone, email, type } = req.body;

    if (!type) {
      return res.status(400).json({ code: 400, message: '请指定验证码类型' });
    }

    if (phone) {
      await authService.sendCode(phone, type);
      return res.json({ code: 200, message: '验证码已发送' });
    }

    if (email) {
      await authService.sendEmailCode(email, type);
      return res.json({ code: 200, message: '验证码已发送' });
    }

    return res.status(400).json({ code: 400, message: '请提供手机号或邮箱' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '发送验证码失败' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { phone, email, code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
    }

    await authService.resetPassword({ phone, email, code, newPassword });
    res.json({ code: 200, message: '密码重置成功' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '重置密码失败' });
  }
});

router.post('/third-party-login', async (req: Request, res: Response) => {
  try {
    const { provider, code, nickname, avatar } = req.body;

    if (!provider || !code) {
      return res.status(400).json({ code: 400, message: '请提供第三方登录信息' });
    }

    if (!['wechat', 'alipay'].includes(provider)) {
      return res.status(400).json({ code: 400, message: '不支持的第三方登录方式' });
    }

    const result = await authService.thirdPartyLogin({ provider, code, nickname, avatar });
    res.json({ code: 200, message: '登录成功', data: result });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '第三方登录失败' });
  }
});

router.post('/bind-third-party', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { provider, code } = req.body;
    const userId = req.user!.id;

    if (!provider || !code) {
      return res.status(400).json({ code: 400, message: '请提供第三方账号信息' });
    }

    await authService.bindThirdParty(userId, provider, code);
    res.json({ code: 200, message: '绑定成功' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '绑定失败' });
  }
});

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);
    res.json({ code: 200, message: '获取成功', data: profile });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message || '获取用户信息失败' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  res.json({ code: 200, message: '退出登录成功' });
});

export default router;
