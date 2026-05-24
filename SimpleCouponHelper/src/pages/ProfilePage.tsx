import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Trophy, Mic, User, Calendar, Play } from 'lucide-react';
import { battleApi, audioApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { BattleHistory, AudioRecord } from '../types';

export default function ProfilePage() {
  const [history, setHistory] = useState<BattleHistory[]>([]);
  const [audios, setAudios] = useState<AudioRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'audios'>('history');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyRes, audiosRes] = await Promise.all([
        battleApi.getHistory(),
        audioApi.getMyAudios()
      ]);
      setHistory(historyRes.data);
      setAudios(audiosRes.data);
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const winCount = history.filter(h => h.isWinner).length;
  const totalCount = history.length;
  const winRate = totalCount > 0 ? Math.round((winCount / totalCount) * 100) : 0;
  const avgScore = totalCount > 0
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / totalCount)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/lobby')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">个人中心</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-6">
            <img
              src={user?.avatar || ''}
              alt=""
              className="w-24 h-24 rounded-2xl border-4 border-primary-500"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{user?.nickname}</h2>
              <p className="text-gray-400 mb-4">@{user?.username}</p>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors text-sm"
              >
                退出登录
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-dark-800 rounded-2xl">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-3xl font-bold text-yellow-400">{winCount}</div>
              <div className="text-sm text-gray-400">胜利场次</div>
            </div>
            <div className="text-center p-4 bg-dark-800 rounded-2xl">
              <Music className="w-8 h-8 mx-auto mb-2 text-primary-400" />
              <div className="text-3xl font-bold text-primary-400">{winRate}%</div>
              <div className="text-sm text-gray-400">胜率</div>
            </div>
            <div className="text-center p-4 bg-dark-800 rounded-2xl">
              <Mic className="w-8 h-8 mx-auto mb-2 text-neon-pink" />
              <div className="text-3xl font-bold text-neon-pink">{avgScore}</div>
              <div className="text-sm text-gray-400">平均得分</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            对战记录
          </button>
          <button
            onClick={() => setActiveTab('audios')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'audios'
                ? 'bg-primary-500 text-white'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            我的录音
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'history' ? (
          history.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">暂无对战记录</p>
              <button
                onClick={() => navigate('/lobby')}
                className="mt-4 px-6 py-3 bg-primary-500 rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                开始对战
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-2xl p-6 flex items-center gap-6 hover:neon-border transition-all cursor-pointer"
                  onClick={() => navigate(`/result/${item.id}`)}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    item.isWinner
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-dark-700'
                  }`}>
                    <Trophy className={`w-8 h-8 ${item.isWinner ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{item.song?.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.isWinner
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.isWinner ? '胜利' : '失败'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        vs {item.opponent?.nickname}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      item.isWinner ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {item.score}
                    </div>
                    <div className="text-sm text-gray-400">得分</div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          audios.length === 0 ? (
            <div className="text-center py-20">
              <Mic className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">暂无录音记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audios.map((audio, index) => (
                <div key={index} className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{audio.songTitle}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(audio.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <audio
                      controls
                      src={`http://localhost:3001${audio.audioUrl}`}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
