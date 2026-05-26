import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { socialRoutes } from './routes/socialRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '晴景天气后端服务运行中' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/social', socialRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 晴景天气后端服务已启动: http://localhost:${PORT}`);
});
