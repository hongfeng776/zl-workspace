import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { run, get, all } from '../database';
import { generateCode, sendSmsCode, checkRateLimit } from '../utils/sms';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phone, type = 'register' } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: '请输入手机号' });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: '请输入有效的手机号' });
    }

    const validTypes = ['register', 'login', 'reset'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: '无效的验证码类型' });
    }

    const rateLimit = checkRateLimit(phone);
    if (!rateLimit.allowed) {
      return res.status(429).json({ message: rateLimit.message });
    }

    const existingCode = await get(
      'SELECT * FROM verification_codes WHERE phone = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [phone, type]
    );

    if (existingCode && new Date(existingCode.expires_at) > new Date()) {
      const timeDiff = Math.ceil((new Date(existingCode.expires_at).getTime() - Date.now()) / 1000);
      if (timeDiff > 240) {
        return res.status(400).json({ 
          message: `验证码已发送，请${timeDiff - 240}秒后再试`,
          code: process.env.NODE_ENV === 'development' ? existingCode.code : undefined
        });
      }
    }

    const code = generateCode();
    
    if (code.length !== 4) {
      console.error('[验证码] 生成失败，长度不正确:', code);
      return res.status(500).json({ message: '验证码生成失败，请稍后重试' });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await run(
      'INSERT INTO verification_codes (phone, code, type, expires_at) VALUES (?, ?, ?, ?)',
      [phone, code, type, expiresAt]
    );

    const smsResult = sendSmsCode(phone, code);
    
    if (!smsResult.success) {
      console.error('[短信] 发送失败:', smsResult.message);
      return res.status(500).json({ message: smsResult.message || '短信发送失败，请稍后重试' });
    }

    console.log(`[验证码] ${type} - 手机号: ${phone}, 验证码: ${code}, 有效期至: ${expiresAt}`);

    res.json({ 
      message: '验证码发送成功', 
      code,
      expiresIn: 300,
      isTestEnv: process.env.NODE_ENV !== 'production'
    });
  } catch (error: any) {
    console.error('[验证码] 发送异常:', error);
    res.status(500).json({ 
      message: '发送验证码失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, code, password, nickname } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ message: '手机号和验证码不能为空' });
    }

    const existingUser = await get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUser) {
      return res.status(400).json({ message: '该手机号已注册' });
    }

    const validCode = await get(
      'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [phone, code, 'register']
    );

    if (!validCode || new Date(validCode.expires_at) < new Date()) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await run(
      'INSERT INTO users (phone, password, nickname) VALUES (?, ?, ?)',
      [phone, hashedPassword, nickname || `用户${phone.slice(-4)}`]
    );

    const token = jwt.sign(
      { id: result.lastID, phone },
      process.env.JWT_SECRET || 'quickride_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ message: '注册成功', token, user: { id: result.lastID, phone, nickname } });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, code, password } = req.body;

    if (!phone) {
      return res.status(400).json({ message: '手机号不能为空' });
    }

    const user = await get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) {
      return res.status(400).json({ message: '该手机号未注册' });
    }

    if (code) {
      const validCode = await get(
        'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [phone, code, 'login']
      );

      if (!validCode || new Date(validCode.expires_at) < new Date()) {
        return res.status(400).json({ message: '验证码无效或已过期' });
      }
    } else if (password) {
      if (!user.password) {
        return res.status(400).json({ message: '请使用验证码登录' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '密码错误' });
      }
    } else {
      return res.status(400).json({ message: '请提供验证码或密码' });
    }

    if (user.status === 0) {
      return res.status(400).json({ message: '账号已被禁用' });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'quickride_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const trips = await all('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [user.id]);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        verified: user.verified === 1
      },
      trips: trips || []
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
      return res.status(400).json({ message: '参数不完整' });
    }

    const user = await get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) {
      return res.status(400).json({ message: '该手机号未注册' });
    }

    const validCode = await get(
      'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [phone, code, 'reset']
    );

    if (!validCode || new Date(validCode.expires_at) < new Date()) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE phone = ?', [
      hashedPassword,
      phone
    ]);

    res.json({ message: '密码重置成功' });
  } catch (error) {
    res.status(500).json({ message: '密码重置失败', error });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: '退出登录成功' });
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await get('SELECT id, phone, nickname, avatar, real_name, verified FROM users WHERE id = ?', [
      req.user?.id
    ]);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error });
  }
});

export default router;
