import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const subjects = [
    {
      id: 'english',
      name: '英语学习',
      description: '单词听写、口语练习、语法训练',
      icon: '🇬🇧',
      progress: user?.progress?.english
    },
    {
      id: 'math',
      name: '数学学习',
      description: '代数、几何、微积分 (即将推出)',
      icon: '🔢',
      progress: user?.progress?.math,
      disabled: true
    }
  ];

  return (
    <div className="dashboard">
      <h2>欢迎回来，{user?.username}！</h2>
      <div className="subject-cards">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="subject-card"
            onClick={() => !subject.disabled && navigate(`/subject/${subject.id}`)}
            style={{ opacity: subject.disabled ? 0.6 : 1, cursor: subject.disabled ? 'not-allowed' : 'pointer' }}
          >
            <h3>{subject.icon} {subject.name}</h3>
            <p>{subject.description}</p>
            {subject.progress && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                  <span>词汇</span>
                  <span>{subject.progress.vocabulary}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${subject.progress.vocabulary}%` }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
