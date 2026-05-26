const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['register', 'login', 'reset_password', 'delete_account', 'security'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

verificationCodeSchema.index({ phone: 1, type: 1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
