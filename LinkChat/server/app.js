require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.dbReady = mongoose.connection.readyState === 1;
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '乐聊服务运行正常',
    dbConnected: req.dbReady,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : '服务器内部错误'
  });
});

const PORT = process.env.PORT || 3001;

const startServer = (port = PORT) => {
  const server = app.listen(port, () => {
    console.log(`✅ 乐聊服务运行在端口 ${port}`);
    console.log(`📡 健康检查: http://localhost:${port}/api/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`⚠️  端口 ${port} 被占用，尝试端口 ${parseInt(port) + 1}`);
      startServer(parseInt(port) + 1);
    } else {
      console.error('❌ 服务启动失败:', error.message);
      process.exit(1);
    }
  });

  process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务...');
    server.close(() => {
      mongoose.connection.close();
      console.log('服务已关闭');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务...');
    server.close(() => {
      mongoose.connection.close();
      console.log('服务已关闭');
      process.exit(0);
    });
  });

  return server;
};

startServer();
