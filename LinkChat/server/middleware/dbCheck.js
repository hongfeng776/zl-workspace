const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: '数据库连接异常，请稍后重试',
      code: 'DB_NOT_CONNECTED'
    });
  }
  next();
};

module.exports = dbCheck;
