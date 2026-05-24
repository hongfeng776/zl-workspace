import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Mic2, UserPlus, LogIn } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login(username, password);
        login(res.data.user, res.data.token);
        navigate('/lobby');
      } else {
        if (!nickname) {
          setError('请输入昵称');
          setLoading(false);
          return;
        }
        const res = await authApi.register(username, password, nickname);
        login(res.data.user, res.data.token);
        navigate('/lobby');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-neon-pink rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan rounded-full opacity-10 blur-3xl animate-pulse-slow" />
      </div>

      <div className="absolute inset-0 opacity-10">
        <div className="flex items-end justify-center h-full gap-1 pb-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-gradient-to-t from-primary-500 to-neon-pink rounded-full wave-bar"
              style={{
                height: `${Math.random() * 100 + 20}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center neon-border">
              <Mic2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-gradient mb-2">
            对歌系统
          </h1>
          <p className="text-gray-400">在线K歌对战平台</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="flex mb-6 bg-dark-800 rounded-2xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isLogin
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !isLogin
                  ? 'bg-gradient-to-r from-neon-pink to-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-white placeholder-gray-500"
                placeholder="请输入用户名"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-white placeholder-gray-500"
                  placeholder="请输入昵称"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-white placeholder-gray-500"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-neon-pink text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed neon-border"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </div>
              ) : (
                isLogin ? '立即登录' : '立即注册'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          <Music className="w-4 h-4 inline mr-1" />
          用音乐连接彼此，用歌声传递快乐
        </p>
      </div>
    </div>
  );
}
