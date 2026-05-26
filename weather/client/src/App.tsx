import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/profile" replace /> : <RegisterPage />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/profile"
        element={
          isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
