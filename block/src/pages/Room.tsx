import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Users, Zap } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { getSocket, disconnectSocket } from '../utils/socket';
import { Room as RoomType } from '../../shared/types';

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, currentRoom, setCurrentRoom } = useAppStore();
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/');
      return;
    }

    const socket = getSocket();

    socket.on('room-updated', (room: RoomType) => {
      setCurrentRoom(room);

      if (room.player1Ready && room.player2Ready) {
        startCountdown(room);
      }
    });

    socket.on('game-started', (room: RoomType) => {
      setCurrentRoom(room);
      navigate(`/game/${room.id}`);
    });

    return () => {
      socket.off('room-updated');
      socket.off('game-started');
    };
  }, [user, roomId, navigate, setCurrentRoom]);

  const startCountdown = (room: RoomType) => {
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        const socket = getSocket();
        socket.emit('start-game', { roomId: room.id });
      }
    }, 1000);
  };

  const handleToggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    const socket = getSocket();
    socket.emit('ready-game', { userId: user!.id, roomId, ready: newReady });
  };

  const handleLeaveRoom = () => {
    const socket = getSocket();
    socket.emit('leave-room', { userId: user!.id, roomId });
    setCurrentRoom(null);
    navigate('/lobby');
  };

  const isHost = currentRoom?.hostId === user?.id;
  const isPlayer1 = currentRoom?.player1?.id === user?.id;
  const playerReady = isPlayer1 ? currentRoom?.player1Ready : currentRoom?.player2Ready;
  const opponentReady = isPlayer1 ? currentRoom?.player2Ready : currentRoom?.player1Ready;

  return (
    <div className="min-h-screen grid-bg p-6 flex flex-col items-center justify-center">
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <p className="text-cyber-primary text-2xl mb-4">游戏即将开始</p>
            <p
              className="text-9xl font-bold text-cyber-primary text-glow-cyan animate-pulse"
              style={{ textShadow: '0 0 30px #00f5ff, 0 0 60px #00f5ff' }}
            >
              {countdown > 0 ? countdown : '开始!'}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        <button
          onClick={handleLeaveRoom}
          className="flex items-center gap-2 text-cyber-primary hover:text-white mb-6 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          返回大厅
        </button>

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyber-primary text-glow-cyan mb-2">
              {currentRoom?.name}
            </h1>
            <p className="text-gray-400">房间号: {roomId}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div
              className={`glass-card rounded-xl p-6 text-center transition-all ${
                playerReady ? 'border-2 border-cyber-accent shadow-neon-green' : ''
              }`}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyber-primary/30 flex items-center justify-center text-3xl text-cyber-primary border-2 border-cyber-primary/50">
                {currentRoom?.player1?.username[0].toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {currentRoom?.player1?.username || '等待玩家...'}
              </h3>
              {isHost && (
                <span className="text-xs text-cyber-warning bg-cyber-warning/20 px-2 py-1 rounded">
                  房主
                </span>
              )}
              {currentRoom?.player1 && (
                <div className="mt-3">
                  {currentRoom.player1Ready ? (
                    <span className="flex items-center justify-center gap-1 text-cyber-accent">
                      <Check className="w-4 h-4" /> 已准备
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" /> 未准备
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              className={`glass-card rounded-xl p-6 text-center transition-all ${
                opponentReady ? 'border-2 border-cyber-accent shadow-neon-green' : ''
              }`}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyber-secondary/30 flex items-center justify-center text-3xl text-cyber-secondary border-2 border-cyber-secondary/50">
                {currentRoom?.player2?.username[0].toUpperCase() || '?'}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {currentRoom?.player2?.username || '等待玩家...'}
              </h3>
              {currentRoom?.player2 && (
                <div className="mt-3">
                  {currentRoom.player2Ready ? (
                    <span className="flex items-center justify-center gap-1 text-cyber-accent">
                      <Check className="w-4 h-4" /> 已准备
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" /> 未准备
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 text-cyber-primary">
              <Zap className="w-6 h-6 animate-pulse" />
              <span className="text-lg">
                {currentRoom?.player1Ready && currentRoom?.player2Ready
                  ? '双方已准备，游戏即将开始!'
                  : currentRoom?.player2
                  ? '等待对方准备...'
                  : '等待另一玩家加入...'}
              </span>
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {currentRoom?.player2 && (
              <button
                onClick={handleToggleReady}
                disabled={currentRoom?.player1Ready && currentRoom?.player2Ready}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  isReady
                    ? 'bg-cyber-accent text-white shadow-neon-green'
                    : 'bg-cyber-primary text-cyber-bg hover:shadow-neon-cyan'
                } disabled:opacity-50`}
              >
                {isReady ? (
                  <>
                    <Check className="w-5 h-5" />
                    取消准备
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    准备游戏
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>游戏规则: 双方同时进行游戏，先堆满的一方输</p>
          <p>操作: ← → 移动 | ↑ 旋转 | ↓ 加速下落 | 空格 直接落下</p>
        </div>
      </div>
    </div>
  );
};
