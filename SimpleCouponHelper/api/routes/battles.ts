import { Router } from 'express';
import { db, uuidv4, Battle, Score } from '../db/index.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  const { roomId, songId } = req.body;

  await db.read();
  const room = db.data.rooms.find(r => r.id === roomId);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  if (room.hostId !== req.userId) {
    return res.status(403).json({ error: '只有房主可以开始对战' });
  }

  if (!room.player1Id || !room.player2Id) {
    return res.status(400).json({ error: '房间人员不足' });
  }

  if (!room.currentSongId) {
    return res.status(400).json({ error: '请先选择歌曲' });
  }

  room.status = 'playing';

  const battle: Battle = {
    id: uuidv4(),
    roomId,
    songId: room.currentSongId,
    player1Id: room.player1Id,
    player2Id: room.player2Id,
    player1AudioUrl: null,
    player2AudioUrl: null,
    winnerId: null,
    createdAt: new Date().toISOString()
  };

  db.data.battles.push(battle);
  await db.write();

  res.json({ battleId: battle.id, room });
});

router.post('/score', authMiddleware, async (req: AuthRequest, res) => {
  const { battleId, pitch, rhythm, energy, lyrics } = req.body;

  await db.read();
  const battle = db.data.battles.find(b => b.id === battleId);

  if (!battle) {
    return res.status(404).json({ error: '对战不存在' });
  }

  if (battle.player1Id !== req.userId && battle.player2Id !== req.userId) {
    return res.status(403).json({ error: '您不是此对战的参与者' });
  }

  const total = Math.round(pitch * 0.4 + rhythm * 0.3 + energy * 0.15 + lyrics * 0.15);

  const score: Score = {
    id: uuidv4(),
    battleId,
    playerId: req.userId!,
    total,
    pitch,
    rhythm,
    energy,
    lyrics
  };

  db.data.scores.push(score);
  await db.write();

  const player1Score = db.data.scores.find(s => s.battleId === battleId && s.playerId === battle.player1Id);
  const player2Score = db.data.scores.find(s => s.battleId === battleId && s.playerId === battle.player2Id);

  if (player1Score && player2Score) {
    if (player1Score.total > player2Score.total) {
      battle.winnerId = battle.player1Id;
    } else if (player2Score.total > player1Score.total) {
      battle.winnerId = battle.player2Id;
    } else {
      battle.winnerId = null;
    }

    const room = db.data.rooms.find(r => r.id === battle.roomId);
    if (room) {
      room.status = 'finished';
    }

    await db.write();
  }

  res.json({ score });
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;

  await db.read();
  const battle = db.data.battles.find(b => b.id === id);

  if (!battle) {
    return res.status(404).json({ error: '对战不存在' });
  }

  const player1 = db.data.users.find(u => u.id === battle.player1Id);
  const player2 = db.data.users.find(u => u.id === battle.player2Id);
  const song = db.data.songs.find(s => s.id === battle.songId);
  const player1Score = db.data.scores.find(s => s.battleId === id && s.playerId === battle.player1Id);
  const player2Score = db.data.scores.find(s => s.battleId === id && s.playerId === battle.player2Id);
  const winner = battle.winnerId ? db.data.users.find(u => u.id === battle.winnerId) : null;

  res.json({
    ...battle,
    player1: player1 ? { id: player1.id, nickname: player1.nickname, avatar: player1.avatar } : null,
    player2: player2 ? { id: player2.id, nickname: player2.nickname, avatar: player2.avatar } : null,
    song: song ? { id: song.id, title: song.title, artist: song.artist } : null,
    player1Score,
    player2Score,
    winner: winner ? { id: winner.id, nickname: winner.nickname, avatar: winner.avatar } : null
  });
});

router.get('/user/history', authMiddleware, async (req: AuthRequest, res) => {
  await db.read();
  
  const userBattles = db.data.battles
    .filter(b => b.player1Id === req.userId || b.player2Id === req.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const history = userBattles.map(battle => {
    const song = db.data.songs.find(s => s.id === battle.songId);
    const opponentId = battle.player1Id === req.userId ? battle.player2Id : battle.player1Id;
    const opponent = db.data.users.find(u => u.id === opponentId);
    const isWinner = battle.winnerId === req.userId;
    const userScore = db.data.scores.find(s => s.battleId === battle.id && s.playerId === req.userId);

    return {
      id: battle.id,
      song: song ? { title: song.title, artist: song.artist } : null,
      opponent: opponent ? { id: opponent.id, nickname: opponent.nickname, avatar: opponent.avatar } : null,
      isWinner,
      score: userScore?.total || 0,
      createdAt: battle.createdAt
    };
  });

  res.json(history);
});

export default router;
