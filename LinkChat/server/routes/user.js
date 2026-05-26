const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const dbAdapter = require('../utils/dbAdapter');

const router = express.Router();

router.use(auth);

router.post('/delete-account', [
  body('code').isLength({ min: 6, max: 6 }).withMessage('验证码格式不正确')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { code } = req.body;
  const { phone } = req.user;

  try {
    const verification = await dbAdapter.VerificationCode.findOne({
      phone,
      code,
      type: 'delete_account',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({ message: '验证码错误或已过期' });
    }

    const user = await dbAdapter.User.findById(req.user._id);
    user.isActive = false;
    await dbAdapter.save(user);

    verification.used = true;
    await dbAdapter.save(verification);

    res.json({ message: '账号注销成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/security-verify', [
  body('questions').isArray({ min: 2, max: 3 }).withMessage('请设置2-3个安全问题')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { questions } = req.body;

  try {
    const user = await dbAdapter.User.findById(req.user._id);
    user.securityQuestions = questions;
    user.securityVerified = true;
    await dbAdapter.save(user);

    res.json({ message: '安全验证设置成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/security-check', [
  body('answers').notEmpty().withMessage('请提供安全问题答案')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { answers } = req.body;

  try {
    const user = await dbAdapter.User.findById(req.user._id);
    if (!user.securityVerified || user.securityQuestions.length === 0) {
      return res.status(400).json({ message: '请先设置安全问题' });
    }

    const answerArray = Array.isArray(answers) ? answers : Object.values(answers);
    
    let correctCount = 0;
    user.securityQuestions.forEach((q, index) => {
      if (answerArray[index] && answerArray[index].trim() === q.answer) {
        correctCount++;
      }
    });

    if (correctCount < user.securityQuestions.length) {
      return res.status(400).json({ message: '安全问题答案不正确' });
    }

    res.json({ message: '安全验证通过' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/security-questions', async (req, res) => {
  try {
    const user = await dbAdapter.User.findById(req.user._id);
    res.json({
      questions: user.securityQuestions.map(q => ({ question: q.question }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/change-password', [
  body('newPassword').isLength({ min: 6, max: 20 }).withMessage('新密码长度为6-20位')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { oldPassword, newPassword, code, phone } = req.body;
  const userId = req.user._id;

  try {
    const user = await dbAdapter.User.findById(userId);

    if (!user.phone) {
      return res.status(400).json({ message: '请先绑定手机号后再设置密码', needBindPhone: true });
    }

    if (user.password) {
      if (!oldPassword) {
        return res.status(400).json({ message: '请输入旧密码' });
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: '旧密码不正确' });
      }

      if (oldPassword === newPassword) {
        return res.status(400).json({ message: '新密码不能与旧密码相同' });
      }
    } else {
      if (!code) {
        return res.status(400).json({ message: '请输入验证码' });
      }

      const verifyPhone = phone || user.phone;
      
      if (verifyPhone !== user.phone) {
        return res.status(400).json({ message: '手机号与当前账号不匹配' });
      }

      const verification = await dbAdapter.VerificationCode.findOne({
        phone: verifyPhone,
        code,
        type: 'set_password',
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!verification) {
        const verification2 = await dbAdapter.VerificationCode.findOne({
          phone: verifyPhone,
          code,
          type: 'change_password',
          used: false,
          expiresAt: { $gt: new Date() }
        });
        if (!verification2) {
          return res.status(400).json({ message: '验证码错误或已过期，请重新获取' });
        }
        verification2.used = true;
        await dbAdapter.save(verification2);
      } else {
        verification.used = true;
        await dbAdapter.save(verification);
      }
    }

    user.password = newPassword;
    await dbAdapter.save(user);

    res.json({ message: '密码设置成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/profile', [
  body('nickname').optional().isLength({ min: 1, max: 20 }).withMessage('昵称长度为1-20位'),
  body('avatar').optional().isURL().withMessage('头像地址格式不正确')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { nickname, avatar } = req.body;

  try {
    const user = await dbAdapter.User.findById(req.user._id);
    if (nickname !== undefined) user.nickname = nickname;
    if (avatar !== undefined) user.avatar = avatar;
    await dbAdapter.save(user);

    res.json({
      message: '个人信息更新成功',
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

module.exports = router;
