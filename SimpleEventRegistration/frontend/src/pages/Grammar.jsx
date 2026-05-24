import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { englishAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Grammar = () => {
  const navigate = useNavigate();
  const { updateUserProgress } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const response = await englishAPI.getGrammarLessons();
      setLessons(response.data);
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = async (lessonId) => {
    try {
      const response = await englishAPI.getGrammarQuestions(lessonId);
      setSelectedLesson(response.data);
      setQuestions(response.data.questions);
      setAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const selectAnswer = (questionIndex, optionIndex) => {
    if (showResults) return;
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const submitQuiz = async () => {
    setShowResults(true);
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / questions.length) * 100);
    try {
      await authAPI.updateProgress({
        subject: 'english',
        category: 'grammar',
        score: score
      });
      updateUserProgress({
        vocabulary: 0,
        speaking: 0,
        grammar: score
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const backToList = () => {
    setSelectedLesson(null);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.answer) correct++;
    });
    return correct;
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center' }}>加载中...</div>;
  }

  if (selectedLesson) {
    return (
      <div>
        <button className="back-btn" onClick={backToList}>
          ← 返回语法列表
        </button>
        <div className="grammar-quiz">
          <h2>{selectedLesson.title}</h2>
          <div className="grammar-desc">{selectedLesson.description}</div>
          
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <h4>第 {qIndex + 1} 题：{question.question}</h4>
              <div className="options">
                {question.options.map((option, oIndex) => {
                  let className = 'option-btn';
                  if (showResults) {
                    if (oIndex === question.answer) {
                      className += ' correct';
                    } else if (answers[qIndex] === oIndex) {
                      className += ' wrong';
                    }
                  } else if (answers[qIndex] === oIndex) {
                    className += ' correct';
                  }
                  
                  return (
                    <button
                      key={oIndex}
                      className={className}
                      onClick={() => selectAnswer(qIndex, oIndex)}
                      disabled={showResults}
                    >
                      {String.fromCharCode(65 + oIndex)}. {option}
                    </button>
                  );
                })}
              </div>
              {showResults && answers[qIndex] !== undefined && (
                <div className="explanation">
                  💡 {question.explanation}
                </div>
              )}
            </div>
          ))}

          {!showResults ? (
            <button
              className="auth-btn"
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== questions.length}
            >
              提交答案
            </button>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h3 style={{ color: '#667eea' }}>
                得分：{getScore()} / {questions.length} ({Math.round((getScore() / questions.length) * 100)}%)
              </h3>
              <button
                className="auth-btn"
                style={{ marginTop: '1rem' }}
                onClick={backToList}
              >
                选择其他语法点
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/subject/english')}>
        ← 返回
      </button>
      <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>语法训练</h2>
      <div className="grammar-list">
        {lessons.map((lesson) => (
          <div
            key={lesson._id}
            className="grammar-item"
            onClick={() => selectLesson(lesson._id)}
          >
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              {lesson.level === 'beginner' ? '初级' : lesson.level === 'intermediate' ? '中级' : '高级'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grammar;
