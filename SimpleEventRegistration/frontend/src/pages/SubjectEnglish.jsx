import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubjectEnglish = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'dictation',
      name: '单词听写',
      description: '听音写词，提高拼写能力',
      icon: '📝'
    },
    {
      id: 'speaking',
      name: '口语练习',
      description: '跟读对话，提升口语表达',
      icon: '🎤'
    },
    {
      id: 'grammar',
      name: '语法训练',
      description: '系统学习英语语法知识',
      icon: '📚'
    }
  ];

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← 返回主页
      </button>
      <h2 style={{ color: 'white', marginBottom: '2rem' }}>英语学习</h2>
      <div className="module-grid">
        {modules.map((module) => (
          <div
            key={module.id}
            className="module-card"
            onClick={() => navigate(`/english/${module.id}`)}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{module.icon}</div>
            <h3>{module.name}</h3>
            <p>{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectEnglish;
