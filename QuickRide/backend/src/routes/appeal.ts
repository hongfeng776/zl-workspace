import { Router, Request, Response } from 'express';
import { run, all, get } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { phone, realName, reason, materials } = req.body;

    if (!phone || !reason) {
      return res.status(400).json({ message: '手机号和申诉原因不能为空' });
    }

    const result = await run(
      'INSERT INTO appeals (phone, real_name, reason, materials) VALUES (?, ?, ?, ?)',
      [phone, realName || '', reason, materials ? JSON.stringify(materials) : '']
    );

    res.json({
      message: '申诉提交成功，我们将在3个工作日内处理',
      appealId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ message: '申诉提交失败', error });
  }
});

router.get('/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await get('SELECT phone FROM users WHERE id = ?', [req.user?.id]);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const appeals = await all('SELECT * FROM appeals WHERE phone = ? ORDER BY created_at DESC', [user.phone]);

    res.json({ appeals });
  } catch (error) {
    res.status(500).json({ message: '获取申诉列表失败', error });
  }
});

export default router;
