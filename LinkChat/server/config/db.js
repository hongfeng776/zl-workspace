const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

const connectDB = async (retries = 5, delay = 2000) => {
  if (isConnected) {
    return Promise.resolve();
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise(async (resolve, reject) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`尝试连接 MongoDB (${i + 1}/${retries})...`);
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 10000,
        });
        isConnected = true;
        console.log('✅ MongoDB 连接成功');
        resolve();
        return;
      } catch (error) {
        console.error(`❌ MongoDB 连接失败 (${i + 1}/${retries}):`, error.message);
        if (i < retries - 1) {
          console.log(`⏳ ${delay / 1000}秒后重试...`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          console.warn('⚠️  警告: MongoDB 连接失败，服务将以受限模式运行');
          console.warn('⚠️  请确保 MongoDB 服务已启动，或修改 .env 中的 MONGODB_URI');
          console.warn('⚠️  数据将不会持久化保存');
          resolve();
        }
      }
    }
  });

  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB 连接断开');
  isConnected = false;
  connectionPromise = null;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB 错误:', error.message);
});

module.exports = connectDB;
