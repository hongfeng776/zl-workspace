import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { initDatabase } from './database';
import authRoutes from './routes/auth';
import verificationRoutes from './routes/verification';
import appealRoutes from './routes/appeal';
import tripRoutes from './routes/trip';
import carRoutes from './routes/car';
import serviceRoutes from './routes/service';
import platformRoutes from './routes/platform';

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/verification', verificationRoutes);
  app.use('/api/appeal', appealRoutes);
  app.use('/api/trip', tripRoutes);
  app.use('/api/car', carRoutes);
  app.use('/api/service', serviceRoutes);
  app.use('/api/platform', platformRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '捷行出行后端服务运行正常' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 捷行出行后端服务已启动: http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
