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
        'INSERT INTO trips (user_id, driver_id, car_type, start_location, end_location, distance, duration, price, status, completed_at, rating, review) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.user?.id,
          trip.driverId || null,
          trip.carType || 'express',
          trip.startLocation,
          trip.endLocation,
          trip.distance || 0,
          trip.duration || 0,
          trip.price || 0,
          trip.status || 'completed',
          trip.completedAt || null,
          trip.rating || null,
          trip.review || null
        ]
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

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tripId = parseInt(req.params.id);
    const trips = await all('SELECT * FROM trips WHERE user_id = ?', [req.user?.id]);
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ message: '行程不存在' });
    }

    if (trip.driver) {
      const reviews = await all('SELECT * FROM reviews WHERE driver_id = ?', [trip.driver.id, 10]);
      trip.driver.reviews = reviews;
    }

    res.json({ trip });
  } catch (error) {
    res.status(500).json({ message: '获取行程详情失败', error });
  }
});

router.post('/:id/review', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tripId = parseInt(req.params.id);
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: '请输入有效的评分（1-5分）' });
    }

    const trips = await all('SELECT * FROM trips WHERE user_id = ?', [req.user?.id]);
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ message: '行程不存在' });
    }

    await run('UPDATE trips SET rating = ?, review = ? WHERE id = ?', [rating, review || null, tripId]);

    if (trip.driver) {
      await run('INSERT INTO reviews (trip_id, driver_id, user_id, rating, content) VALUES (?, ?, ?, ?, ?)', [
        tripId,
        trip.driver.id,
        req.user?.id,
        rating,
        review || null
      ]);
    }

    res.json({ message: '评价成功' });
  } catch (error) {
    res.status(500).json({ message: '评价失败', error });
  }
});

router.get('/driver/:id/reviews', async (req, res) => {
  try {
    const driverId = parseInt(req.params.id);
    const reviews = await all('SELECT * FROM reviews WHERE driver_id = ?', [driverId, 20]);

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: '获取评价失败', error });
  }
});

export default router;
