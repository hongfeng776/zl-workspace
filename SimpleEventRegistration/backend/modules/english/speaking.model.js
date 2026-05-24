const mongoose = require('mongoose');

const speakingSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true
  },
  description: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  hints: [String],
  sampleAnswer: String
});

module.exports = mongoose.model('Speaking', speakingSchema);
