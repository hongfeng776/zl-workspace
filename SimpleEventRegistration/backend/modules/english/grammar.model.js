const mongoose = require('mongoose');

const grammarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  examples: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  questions: [{
    question: String,
    options: [String],
    answer: Number,
    explanation: String
  }]
});

module.exports = mongoose.model('Grammar', grammarSchema);
