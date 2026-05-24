import { Router, type Request, type Response } from 'express';
import { createUser, findUserByUsername } from '../store.js';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: '用户名和密码不能为空' });
      return;
    }
    if (findUserByUsername(username)) {
      res.status(400).json({ success: false, message: '用户名已存在' });
      return;
    }
    const user = createUser(username, password);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = findUserByUsername(username);
    if (!user || user.password !== password) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }
    res.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true });
});

export default router;
