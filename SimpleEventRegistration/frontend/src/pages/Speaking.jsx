import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { englishAPI } from '../services/api';

const Speaking = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await englishAPI.getSpeakingTopics();
      setTopics(response.data);
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectTopic = async (topicId) => {
    try {
      const response = await englishAPI.getSpeakingTopic(topicId);
      setSelectedTopic(response.data);
      setShowSample(false);
    } catch (err) {
      console.error('Failed to load topic:', err);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.start();
    setTimeout(() => {
      try {
        recognition.stop();
      } catch (e) {}
    }, 30000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playSample = () => {
    if (selectedTopic) {
      const utterance = new SpeechSynthesisUtterance(selectedTopic.sampleAnswer);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const backToList = () => {
    setSelectedTopic(null);
    setShowSample(false);
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center' }}>加载中...</div>;
  }

  if (selectedTopic) {
    return (
      <div>
        <button className="back-btn" onClick={backToList}>
          ← 返回话题列表
        </button>
        <div className="speaking-practice">
          <h2>{selectedTopic.topic}</h2>
          <div className="topic-desc">{selectedTopic.description}</div>

          <div className="hints">
            <h4>💡 提示句型</h4>
            <ul>
              {selectedTopic.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            {!isRecording ? (
              <button className="record-btn" onClick={startRecording}>
                🎤 开始录音 (30秒)
              </button>
            ) : (
              <button className="record-btn recording" onClick={stopRecording}>
                ⏹ 停止录音
              </button>
            )}
          </div>

          <button
            className="show-sample-btn"
            onClick={() => setShowSample(!showSample)}
          >
            {showSample ? '隐藏参考答案' : '查看参考答案'}
          </button>

          {showSample && (
            <div className="sample-answer">
              <h4>📖 参考答案</h4>
              <p>{selectedTopic.sampleAnswer}</p>
              <button
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={playSample}
              >
                🔊 播放示范朗读
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
      <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>口语练习</h2>
      <div className="speaking-list">
        {topics.map((topic) => (
          <div
            key={topic._id}
            className="speaking-item"
            onClick={() => selectTopic(topic._id)}
          >
            <h3>🎤 {topic.topic}</h3>
            <p>{topic.description}</p>
            <span style={{ 
              background: '#667eea', 
              color: 'white', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              {topic.level === 'beginner' ? '初级' : topic.level === 'intermediate' ? '中级' : '高级'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Speaking;
