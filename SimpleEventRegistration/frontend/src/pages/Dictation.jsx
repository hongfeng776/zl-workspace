import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { englishAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dictation = () => {
  const navigate = useNavigate();
  const { updateUserProgress } = useAuth();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const response = await englishAPI.getDictationWords({ count: 5 });
      setWords(response.data);
    } catch (err) {
      console.error('Failed to load words:', err);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = () => {
    if (words[currentIndex]) {
      const utterance = new SpeechSynthesisUtterance(words[currentIndex].word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = () => {
    const currentWord = words[currentIndex];
    const correct = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextWord = async () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setChecked(false);
    } else {
      setCompleted(true);
      const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / words.length) * 100);
      try {
        await authAPI.updateProgress({
          subject: 'english',
          category: 'vocabulary',
          score: finalScore
        });
        updateUserProgress({
          vocabulary: finalScore,
          speaking: 0,
          grammar: 0
        });
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setScore(0);
    setChecked(false);
    setCompleted(false);
    loadWords();
  };

  if (loading) {
    return (
      <div className="dictation-container">
        <p style={{ textAlign: 'center' }}>加载中...</p>
      </div>
    );
  }

  if (completed) {
    const finalScore = Math.round((score / words.length) * 100);
    return (
      <div className="dictation-container">
        <h2>练习完成！</h2>
        <div className="score-display">
          你的得分：{score} / {words.length} ({finalScore}%)
        </div>
        <button className="auth-btn" onClick={restart}>
          重新开始
        </button>
        <button
          className="back-btn"
          style={{ width: '100%', marginTop: '1rem', color: '#333' }}
          onClick={() => navigate('/subject/english')}
        >
          返回英语学习
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/subject/english')}>
        ← 返回
      </button>
      <div className="dictation-container">
        <h2>单词听写</h2>
        <div className="score-display">
          进度：{currentIndex + 1} / {words.length} | 得分：{score}
        </div>
        
        <div className="word-display">
          <div className="word-meaning">{currentWord.meaning}</div>
          <div className="word-phonetic">{currentWord.phonetic}</div>
          <button className="listen-btn" onClick={speakWord}>
            🔊 播放发音
          </button>
        </div>

        <input
          type="text"
          className="dictation-input"
          placeholder="请输入你听到的单词"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !checked && checkAnswer()}
          disabled={checked}
        />

        {!checked ? (
          <button className="check-btn" onClick={checkAnswer} disabled={!userInput}>
            检查答案
          </button>
        ) : (
          <div>
            <div className={isCorrect ? 'result-correct' : 'result-wrong'}>
              {isCorrect ? '✅ 正确！' : `❌ 错误！正确答案是: ${currentWord.word}`}
            </div>
            <button className="next-btn" onClick={nextWord}>
              {currentIndex < words.length - 1 ? '下一个单词 →' : '查看结果'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dictation;
