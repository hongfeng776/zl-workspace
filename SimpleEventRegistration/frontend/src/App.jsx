import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubjectEnglish from './pages/SubjectEnglish';
import Dictation from './pages/Dictation';
import Grammar from './pages/Grammar';
import Speaking from './pages/Speaking';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>📚 在线学习平台</h1>
      </Link>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">学习中心</Link>
            <span style={{ color: '#667eea', fontWeight: 500 }}>
              👤 {user?.username}
            </span>
            <button onClick={handleLogout}>退出登录</button>
          </>
        ) : (
          <>
            <Link to="/login">登录</Link>
            <Link to="/register">注册</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const AppContent = () => {
  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject/english"
            element={
              <ProtectedRoute>
                <SubjectEnglish />
              </ProtectedRoute>
            }
          />
          <Route
            path="/english/dictation"
            element={
              <ProtectedRoute>
                <Dictation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/english/grammar"
            element={
              <ProtectedRoute>
                <Grammar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/english/speaking"
            element={
              <ProtectedRoute>
                <Speaking />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
