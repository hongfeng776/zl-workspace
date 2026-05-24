const bcrypt = require('bcryptjs');

let users = [];
let nextUserId = 1;

const vocabularyData = [
  { _id: '1', word: 'apple', phonetic: '/ˈæpl/', meaning: '苹果', example: 'I eat an apple every day.', level: 'beginner', category: 'food' },
  { _id: '2', word: 'beautiful', phonetic: '/ˈbjuːtɪfl/', meaning: '美丽的', example: 'The sunset is beautiful.', level: 'beginner', category: 'adjective' },
  { _id: '3', word: 'computer', phonetic: '/kəmˈpjuːtər/', meaning: '电脑', example: 'I work on my computer.', level: 'beginner', category: 'technology' },
  { _id: '4', word: 'dictionary', phonetic: '/ˈdɪkʃəneri/', meaning: '字典', example: 'Look up the word in the dictionary.', level: 'beginner', category: 'education' },
  { _id: '5', word: 'elephant', phonetic: '/ˈelɪfənt/', meaning: '大象', example: 'The elephant is very big.', level: 'beginner', category: 'animal' },
  { _id: '6', word: 'fantastic', phonetic: '/fænˈtæstɪk/', meaning: '极好的', example: 'That was a fantastic movie!', level: 'beginner', category: 'adjective' },
  { _id: '7', word: 'government', phonetic: '/ˈɡʌvərnmənt/', meaning: '政府', example: 'The government made a new law.', level: 'intermediate', category: 'politics' },
  { _id: '8', word: 'happiness', phonetic: '/ˈhæpinəs/', meaning: '幸福', example: 'Money cannot buy happiness.', level: 'intermediate', category: 'emotion' },
  { _id: '9', word: 'important', phonetic: '/ɪmˈpɔːrtnt/', meaning: '重要的', example: 'Education is very important.', level: 'beginner', category: 'adjective' },
  { _id: '10', word: 'knowledge', phonetic: '/ˈnɑːlɪdʒ/', meaning: '知识', example: 'Knowledge is power.', level: 'intermediate', category: 'education' }
];

const grammarData = [
  {
    _id: '1',
    title: '一般现在时 (Simple Present Tense)',
    description: '表示经常性、习惯性的动作或存在的状态，以及客观真理。',
    examples: ['I usually get up at 7 AM.', 'The sun rises in the east.', 'She works in a hospital.'],
    level: 'beginner',
    questions: [
      { question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'went'], answer: 1, explanation: '第三人称单数主语she后面的动词要加s。' },
      { question: 'They ___ football on weekends.', options: ['play', 'plays', 'playing', 'played'], answer: 0, explanation: '复数主语they后面用动词原形。' },
      { question: 'The earth ___ around the sun.', options: ['move', 'moves', 'moved', 'moving'], answer: 1, explanation: '客观真理用一般现在时，earth是第三人称单数。' }
    ]
  },
  {
    _id: '2',
    title: '现在进行时 (Present Continuous Tense)',
    description: '表示说话时正在进行的动作或当前一段时间内正在进行的动作。',
    examples: ['I am studying English now.', 'They are playing football.', 'She is reading a book.'],
    level: 'beginner',
    questions: [
      { question: 'Look! The children ___ in the park.', options: ['play', 'plays', 'are playing', 'played'], answer: 2, explanation: 'Look!表示动作正在进行，用现在进行时。' },
      { question: 'I ___ to music at the moment.', options: ['listen', 'listens', 'am listening', 'listened'], answer: 2, explanation: 'at the moment表示此刻，用现在进行时。' },
      { question: '___ you ___ your homework now?', options: ['Do, do', 'Are, doing', 'Did, do', 'Have, done'], answer: 1, explanation: 'now表示现在进行时，用be + doing结构。' }
    ]
  },
  {
    _id: '3',
    title: '一般过去时 (Simple Past Tense)',
    description: '表示过去某个时间发生的动作或存在的状态。',
    examples: ['I visited my grandparents yesterday.', 'She went to Beijing last week.', 'They were happy.'],
    level: 'beginner',
    questions: [
      { question: 'I ___ a movie last night.', options: ['watch', 'watches', 'watched', 'watching'], answer: 2, explanation: 'last night表示过去，用动词过去式。' },
      { question: 'She ___ to the party yesterday.', options: ['come', 'comes', 'came', 'coming'], answer: 2, explanation: 'yesterday表示过去，come的过去式是came。' },
      { question: 'They ___ in Shanghai last year.', options: ['live', 'lived', 'lives', 'living'], answer: 1, explanation: 'last year表示过去，live的过去式是lived。' }
    ]
  }
];

const speakingData = [
  {
    _id: '1',
    topic: 'Introduce Yourself',
    description: 'Introduce yourself to the class, including your name, hobbies, and goals.',
    level: 'beginner',
    hints: ['My name is...', 'I am from...', 'My hobbies are...', 'I want to learn English because...'],
    sampleAnswer: 'Hello everyone! My name is Lisa. I am from China. My hobbies are reading books and listening to music. I want to learn English because I want to travel around the world and make friends from different countries.'
  },
  {
    _id: '2',
    topic: 'My Favorite Food',
    description: 'Talk about your favorite food, why you like it, and how often you eat it.',
    level: 'beginner',
    hints: ['My favorite food is...', 'I like it because...', 'I usually eat it at...', 'It tastes...'],
    sampleAnswer: 'My favorite food is dumplings. I like them because they are delicious and my mom makes them for me on weekends. Dumplings are traditional Chinese food. They taste great with soy sauce.'
  },
  {
    _id: '3',
    topic: 'Daily Routine',
    description: 'Describe your daily routine, what time you wake up, eat meals, and go to bed.',
    level: 'beginner',
    hints: ['I usually wake up at...', 'In the morning, I...', 'After school/work, I...', 'I go to bed at...'],
    sampleAnswer: 'I usually wake up at 7 o\'clock in the morning. Then I brush my teeth and have breakfast. I go to school at 8:30. After school, I do my homework and play with my friends. I have dinner with my family at 6 PM. I go to bed at 9:30 PM.'
  },
  {
    _id: '4',
    topic: 'My Dream Vacation',
    description: 'Talk about your dream vacation destination and what you would do there.',
    level: 'intermediate',
    hints: ['My dream vacation is...', 'I want to go there because...', 'I would like to...', 'I hope to...'],
    sampleAnswer: 'My dream vacation is to visit Japan. I want to go there because I love Japanese culture, anime, and food. I would like to visit Tokyo, see Mount Fuji, and try authentic sushi. I also want to learn some basic Japanese phrases before I go.'
  }
];

const createUser = async (username, email, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const user = {
    _id: String(nextUserId++),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date(),
    progress: {
      english: { vocabulary: 0, speaking: 0, grammar: 0 },
      math: { algebra: 0, geometry: 0, calculus: 0 }
    }
  };
  users.push(user);
  return user;
};

const findUserByUsername = (username) => {
  return users.find(u => u.username === username);
};

const findUserByEmail = (email) => {
  return users.find(u => u.email === email);
};

const findUserById = (id) => {
  return users.find(u => u._id === id);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

const getVocabulary = (level, limit = 10) => {
  let result = vocabularyData;
  if (level) {
    result = result.filter(w => w.level === level);
  }
  return result.sort(() => Math.random() - 0.5).slice(0, limit);
};

const getDictationWords = (level = 'beginner', count = 5) => {
  let result = vocabularyData.filter(w => w.level === level);
  result = result.sort(() => Math.random() - 0.5).slice(0, count);
  return result.map(word => ({
    id: word._id,
    word: word.word,
    phonetic: word.phonetic,
    meaning: word.meaning
  }));
};

const getGrammarLessons = (level) => {
  let result = grammarData;
  if (level) {
    result = result.filter(l => l.level === level);
  }
  return result.map(l => ({
    _id: l._id,
    title: l.title,
    description: l.description,
    level: l.level
  }));
};

const getGrammarLessonById = (lessonId) => {
  return grammarData.find(l => l._id === lessonId);
};

const getSpeakingTopics = (level) => {
  let result = speakingData;
  if (level) {
    result = result.filter(t => t.level === level);
  }
  return result;
};

const getSpeakingTopicById = (topicId) => {
  return speakingData.find(t => t._id === topicId);
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  comparePassword,
  getVocabulary,
  getDictationWords,
  getGrammarLessons,
  getGrammarLessonById,
  getSpeakingTopics,
  getSpeakingTopicById
};
