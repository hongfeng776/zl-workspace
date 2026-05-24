const db = require('../../data/memoryDB');

const getVocabulary = (req, res) => {
  try {
    const { level, limit = 10 } = req.query;
    const words = db.getVocabulary(level, parseInt(limit));
    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getDictationWords = (req, res) => {
  try {
    const { level = 'beginner', count = 5 } = req.query;
    const words = db.getDictationWords(level, parseInt(count));
    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getGrammarLessons = (req, res) => {
  try {
    const { level } = req.query;
    const lessons = db.getGrammarLessons(level);
    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getGrammarQuestions = (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = db.getGrammarLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Grammar lesson not found' });
    }
    res.json({
      title: lesson.title,
      description: lesson.description,
      examples: lesson.examples,
      questions: lesson.questions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getSpeakingTopics = (req, res) => {
  try {
    const { level } = req.query;
    const topics = db.getSpeakingTopics(level);
    res.json(topics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getSpeakingTopic = (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = db.getSpeakingTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Speaking topic not found' });
    }
    res.json(topic);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getVocabulary,
  getDictationWords,
  getGrammarLessons,
  getGrammarQuestions,
  getSpeakingTopics,
  getSpeakingTopic
};
