import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { run, get } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG 格式的图片'));
    }
  }
});

router.post(
  '/id-card',
  authMiddleware,
  upload.fields([
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 }
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { realName, idCard } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!realName || !idCard) {
        return res.status(400).json({ message: '请填写真实姓名和身份证号' });
      }

      if (!files?.idCardFront || !files?.idCardBack) {
        return res.status(400).json({ message: '请上传身份证正反面照片' });
      }

      const idCardFrontPath = '/uploads/' + files.idCardFront[0].filename;
      const idCardBackPath = '/uploads/' + files.idCardBack[0].filename;

      await run(
        'UPDATE users SET real_name = ?, id_card = ?, id_card_front = ?, id_card_back = ?, verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [realName, idCard, idCardFrontPath, idCardBackPath, req.user?.id]
      );

      res.json({
        message: '实名认证提交成功',
        data: {
          realName,
          idCard: idCard.replace(/^(.{6})(.+)(.{4})$/, '$1********$3'),
          idCardFront: idCardFrontPath,
          idCardBack: idCardBackPath,
          verified: true
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || '实名认证失败', error });
    }
  }
);

router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const status = await get('SELECT real_name, id_card, id_card_front, id_card_back, verified FROM users WHERE id = ?', [
      req.user?.id
    ]);

    if (!status) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ message: '获取认证状态失败', error });
  }
});

export default router;
