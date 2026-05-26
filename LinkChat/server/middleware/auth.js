const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '请先登录' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: '用户不存在或已被禁用' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};

module.exports = auth;
