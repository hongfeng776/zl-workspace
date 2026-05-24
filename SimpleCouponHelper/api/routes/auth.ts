import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, uuidv4, User } from '../db/index.js';
import { signToken, AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password, nickname } = req.body;

  if (!username || !password || !nickname) {
    return res.status(400).json({ error: '请填写所有必填字段' });
  }

  await db.read();
  const existingUser = db.data.users.find(u => u.username === username);

  if (existingUser) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: uuidv4(),
    username,
    passwordHash,
    nickname,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  await db.write();

  const token = signToken({ id: newUser.id, username: newUser.username });

  res.json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      nickname: newUser.nickname,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    }
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }

  await db.read();
  const user = db.data.users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = signToken({ id: user.id, username: user.username });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    createdAt: user.createdAt
  });
});

router.get('/users', authMiddleware, async (req: AuthRequest, res) => {
  await db.read();
  const users = db.data.users
    .filter(u => u.id !== req.userId)
    .map(u => ({
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      avatar: u.avatar
    }));

  res.json(users);
});

export default router;
