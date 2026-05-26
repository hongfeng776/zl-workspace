import { Router, Response } from 'express';
import { run, all } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { trips } = req.body;

    if (!trips || !Array.isArray(trips)) {
      return res.status(400).json({ message: '行程数据格式错误' });
    }

    for (const trip of trips) {
      await run(
        'INSERT INTO trips (user_id, start_location, end_location, distance, price, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user?.id, trip.startLocation, trip.endLocation, trip.distance || 0, trip.price || 0, trip.status || 'completed']
      );
    }

    res.json({ message: '行程同步成功' });
  } catch (error) {
    res.status(500).json({ message: '行程同步失败', error });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const trips = await all('SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user?.id]);

    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: '获取行程列表失败', error });
  }
});

export default router;
