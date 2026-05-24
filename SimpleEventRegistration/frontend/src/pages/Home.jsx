import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="welcome">
      <h1>在线学习平台</h1>
      <p>开启你的学习之旅，掌握英语、数学等多门学科</p>
      {isAuthenticated ? (
        <Link to="/dashboard">
          <button className="welcome-btn">进入学习中心</button>
        </Link>
      ) : (
        <Link to="/login">
          <button className="welcome-btn">开始学习</button>
        </Link>
      )}
    </div>
  );
};

export default Home;
