const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const auth = require('../middleware/auth');

const router = express.Router();

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

router.post('/send-code', [
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('type').isIn(['register', 'login', 'reset_password', 'delete_account', 'security']).withMessage('验证码类型不正确')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { phone, type } = req.body;

  try {
    if (type === 'register') {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: '该手机号已注册' });
      }
    }

    if (type === 'reset_password') {
      const existingUser = await User.findOne({ phone });
      if (!existingUser) {
        return res.status(400).json({ message: '该手机号未注册' });
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await VerificationCode.deleteMany({ phone, type, used: false });
    await VerificationCode.create({ phone, code, type, expiresAt });

    console.log(`验证码: ${phone} - ${type} - ${code}`);

    res.json({ message: '验证码发送成功', code: process.env.NODE_ENV === 'development' ? code : undefined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/register', [
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('验证码格式不正确'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { phone, code, password, nickname } = req.body;

  try {
    const verification = await VerificationCode.findOne({
      phone,
      code,
      type: 'register',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码错误或已过期' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: '该手机号已注册' });
    }

    const user = await User.create({
      phone,
      password,
      nickname: nickname || `乐聊用户${phone.slice(-4)}`
    });

    verification.used = true;
    await verification.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/login', [
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone, isActive: true });
    if (!user) {
      return res.status(400).json({ message: '手机号或密码错误' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '手机号或密码错误' });
    }

    user.lastLoginTime = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/login-code', [
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('验证码格式不正确')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { phone, code } = req.body;

  try {
    const verification = await VerificationCode.findOne({
      phone,
      code,
      type: 'login',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码错误或已过期' });
    }

    let user = await User.findOne({ phone, isActive: true });
    if (!user) {
      user = await User.create({
        phone,
        nickname: `乐聊用户${phone.slice(-4)}`
      });
    }

    verification.used = true;
    await verification.save();

    user.lastLoginTime = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/reset-password', [
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('验证码格式不正确'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { phone, code, password } = req.body;

  try {
    const verification = await VerificationCode.findOne({
      phone,
      code,
      type: 'reset_password',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码错误或已过期' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    user.password = password;
    await user.save();

    verification.used = true;
    await verification.save();

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/third-party', [
  body('platform').isIn(['wechat', 'qq']).withMessage('平台类型不正确'),
  body('openId').notEmpty().withMessage('openId不能为空')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { platform, openId, nickname, avatar } = req.body;

  try {
    const query = platform === 'wechat' ? { wechatId: openId } : { qqId: openId };
    let user = await User.findOne(query);

    if (!user) {
      user = await User.create({
        ...query,
        nickname: nickname || `${platform === 'wechat' ? '微信' : 'QQ'}用户`,
        avatar: avatar || ''
      });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: '账号已被禁用' });
    }

    user.lastLoginTime = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/user-info', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        phone: req.user.phone,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        securityVerified: req.user.securityVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
