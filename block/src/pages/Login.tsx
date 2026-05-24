import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { getSocket, disconnectSocket } from '../utils/socket';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          setUser(data.user);
          const socket = getSocket();
          if (!socket.connected) {
            socket.connect();
          }
          socket.emit('set-user', data.user.id);
          setSuccess('登录成功，正在进入大厅...');
          setTimeout(() => {
            navigate('/lobby');
          }, 500);
        } else {
          setSuccess('注册成功！请使用该账号登录');
          setTimeout(() => {
            setIsLogin(true);
            setSuccess('');
            setPassword('');
          }, 1500);
        }
      } else {
        setError(data.message || (isLogin ? '登录失败' : '注册失败'));
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('网络错误，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg p-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md animate-float">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-cyber-primary" style={{ filter: 'drop-shadow(0 0 15px #00f5ff)' }} />
          </div>
          <h1 className="text-4xl font-bold text-cyber-primary text-glow-cyan mb-2">
            俄罗斯方块
          </h1>
          <p className="text-gray-400">在线对战版</p>
        </div>

        <div className="flex mb-6 bg-cyber-dark rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition-all ${
              isLogin
                ? 'bg-cyber-primary text-cyber-bg font-bold shadow-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition-all ${
              !isLogin
                ? 'bg-cyber-primary text-cyber-bg font-bold shadow-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cyber-primary text-sm mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary transition-all"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-cyber-primary text-sm mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary transition-all"
              placeholder="请输入密码"
              required
            />
          </div>

          {success && (
            <div className="text-cyber-accent text-sm text-center py-2 bg-cyber-accent/10 rounded-lg border border-cyber-accent/30 animate-pulse">
              {success}
            </div>
          )}

          {error && (
            <div className="text-cyber-danger text-sm text-center py-2 bg-cyber-danger/10 rounded-lg border border-cyber-danger/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyber-primary text-cyber-bg font-bold rounded-lg btn-neon hover:shadow-neon-cyan transition-all disabled:opacity-50"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  );
};
