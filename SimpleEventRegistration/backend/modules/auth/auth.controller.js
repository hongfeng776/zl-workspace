const jwt = require('jsonwebtoken');
const db = require('../../data/memoryDB');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (db.findUserByUsername(username)) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    const user = await db.createUser(username, email, password);

    const payload = {
      user: {
        id: user._id,
        username: user.username
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            progress: user.progress
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = db.findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    const isMatch = await db.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    const payload = {
      user: {
        id: user._id,
        username: user.username
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            progress: user.progress
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getProfile = async (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateProgress = async (req, res) => {
  try {
    const { subject, category, score } = req.body;
    const user = db.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user.progress[subject] && user.progress[subject][category] !== undefined) {
      user.progress[subject][category] = Math.max(
        user.progress[subject][category],
        score
      );
    }
    
    res.json({ progress: user.progress });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { register, login, getProfile, updateProgress };
