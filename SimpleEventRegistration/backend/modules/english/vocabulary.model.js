const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true
  },
  phonetic: String,
  meaning: {
    type: String,
    required: true
  },
  example: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: String
});

module.exports = mongoose.model('Vocabulary', vocabularySchema);
