const express = require('express');
const router = express.Router();
const englishController = require('./english.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/vocabulary', authMiddleware, englishController.getVocabulary);
router.get('/dictation', authMiddleware, englishController.getDictationWords);
router.get('/grammar', authMiddleware, englishController.getGrammarLessons);
router.get('/grammar/:lessonId', authMiddleware, englishController.getGrammarQuestions);
router.get('/speaking', authMiddleware, englishController.getSpeakingTopics);
router.get('/speaking/:topicId', authMiddleware, englishController.getSpeakingTopic);

module.exports = router;
