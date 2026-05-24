import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Home, RotateCcw, Music, Mic, Target, Zap, FileText, Play, Pause } from 'lucide-react';
import { battleApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Battle } from '../types';

export default function ResultPage() {
  const { battleId } = useParams<{ battleId: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useState<HTMLAudioElement | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    loadBattle();
  }, [battleId]);

  const loadBattle = async () => {
    if (!battleId) return;
    try {
      const res = await battleApi.getBattle(battleId);
      setBattle(res.data);
    } catch (err) {
      console.error('加载对战结果失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-yellow-400';
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-blue-400';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isWinner = battle?.winner?.id === user?.id;
  const isTie = !battle?.winner;

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold font-display mb-4">
            {isTie ? (
              <span className="text-gray-300">平局！</span>
            ) : isWinner ? (
              <span className="text-gradient">胜利！</span>
            ) : (
              <span className="text-gray-400">惜败...</span>
            )}
          </h1>
          <p className="text-xl text-gray-400">
            {battle?.song?.title} - {battle?.song?.artist}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {[
            { player: battle?.player1, score: battle?.player1Score, side: 'left' },
            { player: battle?.player2, score: battle?.player2Score, side: 'right' }
          ].map(({ player, score, side }, i) => (
            <div
              key={i}
              className={`glass rounded-3xl p-8 relative overflow-hidden ${
                battle?.winner?.id === player?.id ? 'neon-border' : ''
              }`}
            >
              {battle?.winner?.id === player?.id && (
                <div className="absolute top-4 right-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
              )}

              <div className="text-center mb-8">
                <img
                  src={player?.avatar || ''}
                  alt=""
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary-500"
                />
                <h3 className="text-2xl font-bold mb-1">{player?.nickname}</h3>
                <div className={`text-6xl font-bold font-display ${getScoreColor(score?.total || 0)} animate-score-up`}>
                  {score?.total || 0}
                </div>
                <p className="text-gray-400 mt-2">总分</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">音准</span>
                      <span className="font-semibold">{score?.pitch || 0}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score?.pitch || 0)} transition-all duration-1000`}
                        style={{ width: `${score?.pitch || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">节奏</span>
                      <span className="font-semibold">{score?.rhythm || 0}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score?.rhythm || 0)} transition-all duration-1000`}
                        style={{ width: `${score?.rhythm || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">能量</span>
                      <span className="font-semibold">{score?.energy || 0}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score?.energy || 0)} transition-all duration-1000`}
                        style={{ width: `${score?.energy || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">歌词</span>
                      <span className="font-semibold">{score?.lyrics || 0}</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBarColor(score?.lyrics || 0)} transition-all duration-1000`}
                        style={{ width: `${score?.lyrics || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/lobby')}
            className="px-8 py-4 glass rounded-2xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            返回大厅
          </button>
          <button
            onClick={() => navigate('/lobby')}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-neon-pink rounded-2xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 neon-border"
          >
            <RotateCcw className="w-5 h-5" />
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}
