import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from '../db/index.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads/audios');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持音频文件'));
    }
  }
});

router.post('/upload', authMiddleware, upload.single('audio'), async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '未上传文件' });
  }

  const { battleId } = req.body;

  await db.read();
  const battle = db.data.battles.find(b => b.id === battleId);

  if (!battle) {
    return res.status(404).json({ error: '对战不存在' });
  }

  const audioUrl = `/api/audio/file/${req.file.filename}`;

  if (battle.player1Id === req.userId) {
    battle.player1AudioUrl = audioUrl;
  } else if (battle.player2Id === req.userId) {
    battle.player2AudioUrl = audioUrl;
  } else {
    return res.status(403).json({ error: '您不是此对战的参与者' });
  }

  await db.write();

  res.json({
    success: true,
    audioUrl,
    filename: req.file.filename
  });
});

router.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: '文件不存在' });
  }
});

router.get('/my-audios', authMiddleware, async (req: AuthRequest, res) => {
  await db.read();
  
  const userBattles = db.data.battles.filter(
    b => b.player1Id === req.userId || b.player2Id === req.userId
  );

  const audios = userBattles.map(battle => {
    const isPlayer1 = battle.player1Id === req.userId;
    const audioUrl = isPlayer1 ? battle.player1AudioUrl : battle.player2AudioUrl;
    const song = db.data.songs.find(s => s.id === battle.songId);

    return {
      battleId: battle.id,
      songTitle: song?.title || '未知歌曲',
      audioUrl,
      createdAt: battle.createdAt
    };
  }).filter(a => a.audioUrl);

  res.json(audios);
});

export default router;
