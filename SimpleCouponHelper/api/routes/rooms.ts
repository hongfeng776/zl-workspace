import { Router } from 'express';
import { db, uuidv4, Room } from '../db/index.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  await db.read();
  
  const rooms = db.data.rooms.map(room => {
    const player1 = room.player1Id ? db.data.users.find(u => u.id === room.player1Id) : null;
    const player2 = room.player2Id ? db.data.users.find(u => u.id === room.player2Id) : null;
    
    return {
      ...room,
      player1: player1 ? { id: player1.id, nickname: player1.nickname, avatar: player1.avatar } : null,
      player2: player2 ? { id: player2.id, nickname: player2.nickname, avatar: player2.avatar } : null
    };
  });

  res.json(rooms);
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: '请输入房间名称' });
  }

  await db.read();

  const newRoom: Room = {
    id: uuidv4(),
    name,
    hostId: req.userId!,
    player1Id: req.userId!,
    player2Id: null,
    status: 'waiting',
    currentSongId: null,
    createdAt: new Date().toISOString()
  };

  db.data.rooms.push(newRoom);
  await db.write();

  const player1 = db.data.users.find(u => u.id === newRoom.player1Id);

  res.json({
    ...newRoom,
    player1: player1 ? { id: player1.id, nickname: player1.nickname, avatar: player1.avatar } : null,
    player2: null
  });
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  await db.read();
  const room = db.data.rooms.find(r => r.id === id);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  const player1 = room.player1Id ? db.data.users.find(u => u.id === room.player1Id) : null;
  const player2 = room.player2Id ? db.data.users.find(u => u.id === room.player2Id) : null;
  const currentSong = room.currentSongId ? db.data.songs.find(s => s.id === room.currentSongId) : null;

  res.json({
    ...room,
    player1: player1 ? { id: player1.id, nickname: player1.nickname, avatar: player1.avatar } : null,
    player2: player2 ? { id: player2.id, nickname: player2.nickname, avatar: player2.avatar } : null,
    currentSong: currentSong ? { id: currentSong.id, title: currentSong.title, artist: currentSong.artist } : null
  });
});

router.post('/:id/join', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  await db.read();
  const roomIndex = db.data.rooms.findIndex(r => r.id === id);

  if (roomIndex === -1) {
    return res.status(404).json({ error: '房间不存在' });
  }

  const room = db.data.rooms[roomIndex];

  if (room.player1Id && room.player2Id) {
    return res.status(400).json({ error: '房间已满' });
  }

  if (room.player1Id === req.userId || room.player2Id === req.userId) {
    return res.status(400).json({ error: '您已在房间中' });
  }

  if (!room.player1Id) {
    room.player1Id = req.userId!;
  } else {
    room.player2Id = req.userId!;
  }

  if (room.player1Id && room.player2Id) {
    room.status = 'ready';
  }

  await db.write();

  const player1 = room.player1Id ? db.data.users.find(u => u.id === room.player1Id) : null;
  const player2 = room.player2Id ? db.data.users.find(u => u.id === room.player2Id) : null;

  res.json({
    ...room,
    player1: player1 ? { id: player1.id, nickname: player1.nickname, avatar: player1.avatar } : null,
    player2: player2 ? { id: player2.id, nickname: player2.nickname, avatar: player2.avatar } : null
  });
});

router.post('/:id/leave', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  await db.read();
  const roomIndex = db.data.rooms.findIndex(r => r.id === id);

  if (roomIndex === -1) {
    return res.status(404).json({ error: '房间不存在' });
  }

  const room = db.data.rooms[roomIndex];

  if (room.player1Id === req.userId) {
    room.player1Id = room.player2Id;
    room.player2Id = null;
    room.hostId = room.player1Id || room.hostId;
  } else if (room.player2Id === req.userId) {
    room.player2Id = null;
  } else {
    return res.status(400).json({ error: '您不在此房间中' });
  }

  if (!room.player1Id && !room.player2Id) {
    db.data.rooms.splice(roomIndex, 1);
  } else {
    room.status = 'waiting';
  }

  await db.write();

  res.json({ success: true });
});

router.post('/:id/select-song', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { songId } = req.body;

  await db.read();
  const room = db.data.rooms.find(r => r.id === id);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  if (room.hostId !== req.userId) {
    return res.status(403).json({ error: '只有房主可以选择歌曲' });
  }

  const song = db.data.songs.find(s => s.id === songId);
  if (!song) {
    return res.status(404).json({ error: '歌曲不存在' });
  }

  room.currentSongId = songId;
  await db.write();

  res.json({ success: true, song: { id: song.id, title: song.title, artist: song.artist } });
});

export default router;
