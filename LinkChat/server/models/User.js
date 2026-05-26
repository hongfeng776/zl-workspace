const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      return !this.wechatId && !this.qqId;
    }
  },
  nickname: {
    type: String,
    default: '乐聊用户'
  },
  avatar: {
    type: String,
    default: ''
  },
  wechatId: {
    type: String,
    unique: true,
    sparse: true
  },
  qqId: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginTime: {
    type: Date
  },
  lastLoginIp: {
    type: String
  },
  securityVerified: {
    type: Boolean,
    default: false
  },
  securityQuestions: [{
    question: String,
    answer: String
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
