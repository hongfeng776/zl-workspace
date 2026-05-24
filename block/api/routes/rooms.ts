import { Router, type Request, type Response } from 'express';
import { getRoomsList } from '../store.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = getRoomsList();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取房间列表失败' });
  }
});

export default router;
