import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  await db.read();
  
  const songs = db.data.songs.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    duration: song.duration,
    coverUrl: song.coverUrl
  }));

  res.json(songs);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  await db.read();
  const song = db.data.songs.find(s => s.id === id);

  if (!song) {
    return res.status(404).json({ error: '歌曲不存在' });
  }

  res.json(song);
});

export default router;
