import express from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();

interface User {
  id: number;
  nickname: string;
  phone: string;
  email?: string;
  password: string;
  avatar?: string;
  wechatOpenId?: string;
  alipayUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VerificationCode {
  id: number;
  phone?: string;
  email?: string;
  code: string;
  type: 'register' | 'login' | 'reset_password';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

let users: User[] = [];
let verificationCodes: VerificationCode[] = [];
let userIdCounter = 1;
let codeIdCounter = 1;

function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateToken(userId: number): string {
  const payload = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decodeToken(token: string): { userId: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function findUserByPhone(phone: string): User | undefined {
  return users.find(u => u.phone === phone);
}

function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

function findUserByWechatOpenId(openId: string): User | undefined {
  return users.find(u => u.wechatOpenId === openId);
}

function findUserByAlipayUserId(userId: string): User | undefined {
  return users.find(u => u.alipayUserId === userId);
}

function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const now = new Date();
  const user: User = {
    id: userIdCounter++,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  return user;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/auth/send-code', (req, res) => {
  try {
    const { phone, email, type } = req.body;

    if (!type) {
      return res.status(400).json({ code: 400, message: '请指定验证码类型' });
    }

    if (!['register', 'login', 'reset_password'].includes(type)) {
      return res.status(400).json({ code: 400, message: '无效的验证码类型' });
    }

    if (phone) {
      const existingUser = findUserByPhone(phone);
      if (type === 'register' && existingUser) {
        return res.status(400).json({ code: 400, message: '该手机号已注册' });
      }
      if (type !== 'register' && !existingUser) {
        return res.status(400).json({ code: 400, message: '该手机号未注册' });
      }

      const code = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      verificationCodes.push({
        id: codeIdCounter++,
        phone,
        code,
        type,
        expiresAt,
        used: false,
        createdAt: new Date(),
      });

      console.log(`[SMS Mock] 发送到 ${phone}: 验证码 ${code}, 类型: ${type}`);
      return res.json({ code: 200, message: '验证码已发送', data: { code } });
    }

    if (email) {
      const existingUser = findUserByEmail(email);
      if (type === 'register' && existingUser) {
        return res.status(400).json({ code: 400, message: '该邮箱已被使用' });
      }
      if (type !== 'register' && !existingUser) {
        return res.status(400).json({ code: 400, message: '该邮箱未注册' });
      }

      const code = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      verificationCodes.push({
        id: codeIdCounter++,
        email,
        code,
        type,
        expiresAt,
        used: false,
        createdAt: new Date(),
      });

      console.log(`[EMAIL Mock] 发送到 ${email}: 验证码 ${code}, 类型: ${type}`);
      return res.json({ code: 200, message: '验证码已发送', data: { code } });
    }

    return res.status(400).json({ code: 400, message: '请提供手机号或邮箱' });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '发送验证码失败' });
  }
});

app.post('/api/auth/register', (req, res) => {
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

    const now = new Date();
    const codeRecord = verificationCodes.find(
      c => c.phone === phone && c.code === code && c.type === 'register' && !c.used && c.expiresAt > now
    );

    if (!codeRecord) {
      return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
    }

    if (findUserByPhone(phone)) {
      return res.status(400).json({ code: 400, message: '该手机号已注册' });
    }

    if (email && findUserByEmail(email)) {
      return res.status(400).json({ code: 400, message: '该邮箱已被使用' });
    }

    codeRecord.used = true;

    const user = createUser({
      nickname,
      phone,
      email,
      password: hashPassword(password),
    });

    const token = generateToken(user.id);
    res.json({
      code: 200,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          wechatOpenId: user.wechatOpenId,
          alipayUserId: user.alipayUserId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '注册失败' });
  }
});

app.post('/api/auth/login', (req, res) => {
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

    const user = findUserByPhone(account);
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户不存在' });
    }

    if (loginType === 'password') {
      if (!comparePassword(password!, user.password)) {
        return res.status(400).json({ code: 400, message: '密码错误' });
      }
    } else {
      const now = new Date();
      const codeRecord = verificationCodes.find(
        c => c.phone === account && c.code === code && c.type === 'login' && !c.used && c.expiresAt > now
      );
      if (!codeRecord) {
        return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
      }
      codeRecord.used = true;
    }

    const token = generateToken(user.id);
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          wechatOpenId: user.wechatOpenId,
          alipayUserId: user.alipayUserId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '登录失败' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { phone, email, code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
    }

    let user: User | undefined;
    if (phone) {
      user = findUserByPhone(phone);
    } else if (email) {
      user = findUserByEmail(email);
    }

    if (!user) {
      return res.status(400).json({ code: 400, message: '用户不存在' });
    }

    const now = new Date();
    const codeRecord = verificationCodes.find(
      c =>
        (c.phone === phone || c.email === email) &&
        c.code === code &&
        c.type === 'reset_password' &&
        !c.used &&
        c.expiresAt > now
    );

    if (!codeRecord) {
      return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
    }

    codeRecord.used = true;
    user.password = hashPassword(newPassword);
    user.updatedAt = new Date();

    res.json({ code: 200, message: '密码重置成功' });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '重置密码失败' });
  }
});

app.post('/api/auth/third-party-login', (req, res) => {
  try {
    const { provider, code, nickname, avatar } = req.body;

    if (!provider || !code) {
      return res.status(400).json({ code: 400, message: '请提供第三方登录信息' });
    }

    if (!['wechat', 'alipay'].includes(provider)) {
      return res.status(400).json({ code: 400, message: '不支持的第三方登录方式' });
    }

    let user: User | undefined;

    if (provider === 'wechat') {
      const mockOpenId = `wx_${code}`;
      user = findUserByWechatOpenId(mockOpenId);
      if (!user) {
        user = createUser({
          nickname: nickname || `微信用户${Date.now().toString().slice(-6)}`,
          phone: `wx_${Date.now().toString().slice(-11)}`,
          password: hashPassword('third_party_default'),
          wechatOpenId: mockOpenId,
          avatar,
        });
      }
    } else {
      const mockUserId = `alipay_${code}`;
      user = findUserByAlipayUserId(mockUserId);
      if (!user) {
        user = createUser({
          nickname: nickname || `支付宝用户${Date.now().toString().slice(-6)}`,
          phone: `ali_${Date.now().toString().slice(-11)}`,
          password: hashPassword('third_party_default'),
          alipayUserId: mockUserId,
          avatar,
        });
      }
    }

    const token = generateToken(user.id);
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          wechatOpenId: user.wechatOpenId,
          alipayUserId: user.alipayUserId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '第三方登录失败' });
  }
});

app.post('/api/auth/bind-third-party', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 401, message: '无效的认证令牌' });
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    const { provider, code } = req.body;
    if (!provider || !code) {
      return res.status(400).json({ code: 400, message: '请提供第三方账号信息' });
    }

    if (provider === 'wechat') {
      user.wechatOpenId = `wx_${code}`;
    } else {
      user.alipayUserId = `alipay_${code}`;
    }
    user.updatedAt = new Date();

    res.json({ code: 200, message: '绑定成功' });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '绑定失败' });
  }
});

app.get('/api/auth/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 401, message: '无效的认证令牌' });
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
        alipayUserId: user.alipayUserId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(400).json({ code: 400, message: error.message || '获取用户信息失败' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ code: 200, message: '退出登录成功' });
});

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'Server is running', data: { timestamp: new Date().toISOString() } });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log(`Server is accessible on http://0.0.0.0:${config.port}`);
});
