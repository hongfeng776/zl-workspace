const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./modules/auth/auth.routes');
const englishRoutes = require('./modules/english/english.routes');

app.use('/api/auth', authRoutes);
app.use('/api/english', englishRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Education Platform API is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
