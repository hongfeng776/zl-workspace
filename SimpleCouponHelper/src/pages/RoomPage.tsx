import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Mic, MicOff, Music, Users, X, Volume2 } from 'lucide-react';
import { roomApi, songApi, battleApi, audioApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Room, Song, LyricLine } from '../types';
import { io, Socket } from 'socket.io-client';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [partnerPitch, setPartnerPitch] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    if (roomId && user) {
      newSocket.emit('join-room', roomId, user.id);
    }

    newSocket.on('start-singing', () => {
      startBattle();
    });

    newSocket.on('partner-singing', (data) => {
      setPartnerPitch(data.pitch || 0);
    });

    newSocket.on('show-result', (data) => {
      navigate(`/result/${data.battleId}`);
    });

    return () => {
      newSocket.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [roomId, user, navigate]);

  useEffect(() => {
    loadRoom();
    loadSongs();
  }, [roomId]);

  const loadRoom = async () => {
    if (!roomId) return;
    try {
      const res = await roomApi.getRoom(roomId);
      setRoom(res.data);
    } catch (err) {
      console.error('加载房间失败:', err);
    }
  };

  const loadSongs = async () => {
    try {
      const res = await songApi.getSongs();
      setSongs(res.data);
    } catch (err) {
      console.error('加载歌曲失败:', err);
    }
  };

  const handleSelectSong = async (song: Song) => {
    if (!roomId) return;
    try {
      await roomApi.selectSong(roomId, song.id);
      const detailRes = await songApi.getSong(song.id);
      setSelectedSong(detailRes.data);
      setShowSongModal(false);
      loadRoom();
    } catch (err) {
      console.error('选择歌曲失败:', err);
    }
  };

  const startBattle = async () => {
    if (!roomId || !selectedSong) return;
    
    setLoading(true);
    try {
      const res = await battleApi.startBattle(roomId, selectedSong.id);
      setBattleId(res.data.battleId);
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      
      await startRecording();
      
      const animate = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentTime(elapsed);
        
        if (selectedSong.lyrics) {
          const newIndex = selectedSong.lyrics.findIndex(
            (line: LyricLine, i: number) => {
              const nextLine = selectedSong.lyrics![i + 1];
              return elapsed >= line.time && (!nextLine || elapsed < nextLine.time);
            }
          );
          if (newIndex !== -1 && newIndex !== currentLyricIndex) {
            setCurrentLyricIndex(newIndex);
          }
        }
        
        if (elapsed < 50) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          finishBattle();
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } catch (err) {
      console.error('开始对战失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (battleId) {
          try {
            await audioApi.uploadAudio(battleId, audioBlob);
            
            const pitch = Math.floor(Math.random() * 30) + 60;
            const rhythm = Math.floor(Math.random() * 30) + 60;
            const energy = Math.floor(Math.random() * 30) + 60;
            const lyrics = Math.floor(Math.random() * 30) + 60;
            
            await battleApi.submitScore(battleId, pitch, rhythm, energy, lyrics);
          } catch (err) {
            console.error('上传音频失败:', err);
          }
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('录音失败:', err);
    }
  };

  const finishBattle = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPlaying(false);
    
    if (battleId && roomId) {
      socket?.emit('battle-finish', { roomId, battleId });
      setTimeout(() => navigate(`/result/${battleId}`), 1000);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    try {
      await roomApi.leaveRoom(roomId);
      navigate('/lobby');
    } catch (err) {
      console.error('离开房间失败:', err);
    }
  };

  const isHost = room?.hostId === user?.id;
  const canStart = isHost && room?.player1 && room?.player2 && (room?.currentSong || selectedSong);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveRoom}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{room?.name || '加载中...'}</h1>
              <p className="text-sm text-gray-400">
                {room?.status === 'waiting' ? '等待玩家加入' : room?.status === 'playing' ? '对战进行中' : '准备就绪'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {[room?.player1, room?.player2].map((player, i) => (
                  player ? (
                    <div key={i} className="flex items-center gap-2">
                      <img src={player.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <span className="text-sm">{player.nickname}</span>
                    </div>
                  ) : (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600" />
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!isPlaying ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-8 mb-8">
              {[room?.player1, room?.player2].map((player, i) => (
                <div key={i} className={`glass rounded-3xl p-8 text-center ${
                  player?.id === user?.id ? 'neon-border' : ''
                }`}>
                  <div className="relative inline-block mb-4">
                    <img
                      src={player?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=empty'}
                      alt=""
                      className="w-24 h-24 rounded-full mx-auto"
                    />
                    {player?.id === user?.id && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {player?.nickname || '等待对手...'}
                  </h3>
                  <p className="text-gray-400">
                    {player?.id === user?.id ? '你' : i === 0 ? '玩家1' : '玩家2'}
                  </p>
                  
                  {isRecording && (
                    <div className="mt-4 flex items-center justify-center gap-1 h-8">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="w-2 bg-neon-pink rounded-full wave-bar"
                          style={{ height: '20px' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="glass rounded-3xl p-8 mb-8">
              <h2 className="text-xl font-bold mb-6">当前歌曲</h2>
              {(selectedSong || room?.currentSong) ? (
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center">
                    <Music className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      {selectedSong?.title || room?.currentSong?.title}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {selectedSong?.artist || room?.currentSong?.artist}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Volume2 className="w-4 h-4" />
                      <span>时长: {selectedSong?.duration || 240}秒</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 mb-4">还没有选择歌曲</p>
                  {isHost && (
                    <button
                      onClick={() => setShowSongModal(true)}
                      className="px-6 py-3 bg-primary-500 rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                      选择歌曲
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center">
              {canStart ? (
                <button
                  onClick={startBattle}
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-primary-500 to-neon-pink rounded-2xl font-bold text-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed neon-border flex items-center gap-3 mx-auto"
                >
                  <Play className="w-6 h-6" />
                  {loading ? '准备中...' : '开始对战'}
                </button>
              ) : (
                <div className="text-gray-400">
                  {!room?.player2 ? '等待对手加入...' : !room?.currentSong ? '请房主选择歌曲' : '准备就绪'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                录制中
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {selectedSong?.title}
              </h2>
              <p className="text-gray-400">{selectedSong?.artist}</p>
            </div>

            <div className="glass rounded-3xl p-12 mb-8 min-h-[300px] flex flex-col items-center justify-center">
              <div className="relative w-full">
                {selectedSong?.lyrics && selectedSong.lyrics.map((line: LyricLine, i: number) => (
                  <p
                    key={i}
                    className={`text-center transition-all duration-300 ${
                      i === currentLyricIndex
                        ? 'text-3xl font-bold text-gradient py-4 neon-text'
                        : i === currentLyricIndex - 1 || i === currentLyricIndex + 1
                        ? 'text-xl text-gray-400 py-2'
                        : 'text-gray-600 py-1 text-sm'
                    }`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="glass rounded-2xl p-6 text-center">
                <img
                  src={room?.player1?.avatar || ''}
                  alt=""
                  className="w-12 h-12 rounded-full mx-auto mb-3"
                />
                <p className="font-medium">{room?.player1?.nickname}</p>
                <div className="mt-3 flex items-center justify-center gap-1 h-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary-500 rounded-full wave-bar"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 text-center">
                <img
                  src={room?.player2?.avatar || ''}
                  alt=""
                  className="w-12 h-12 rounded-full mx-auto mb-3"
                />
                <p className="font-medium">{room?.player2?.nickname}</p>
                <div className="mt-3 flex items-center justify-center gap-1 h-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-neon-pink rounded-full wave-bar"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-3 text-gray-400">
                <Mic className="w-5 h-5 animate-pulse" />
                <span>{Math.floor(currentTime)}s</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {showSongModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">选择歌曲</h3>
              <button
                onClick={() => setShowSongModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  className="flex items-center gap-4 p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{song.title}</h4>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
