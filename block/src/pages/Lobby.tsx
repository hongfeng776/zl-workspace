import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Users, Crown } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { getSocket, disconnectSocket } from '../utils/socket';
import { Room } from '../../shared/types';

export const Lobby: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const navigate = useNavigate();
  const { user, setUser, setCurrentRoom } = useAppStore();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchRooms();
    const socket = getSocket();

    socket.on('rooms-updated', fetchRooms);
    socket.on('room-created', (room: Room) => {
      setCurrentRoom(room);
      navigate(`/room/${room.id}`);
    });

    return () => {
      socket.off('rooms-updated');
      socket.off('room-created');
    };
  }, [user, navigate, setCurrentRoom]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms');
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to fetch rooms');
    }
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;
    const socket = getSocket();
    socket.emit('create-room', { userId: user!.id, roomName: newRoomName.trim() });
    setShowCreateModal(false);
    setNewRoomName('');
  };

  const handleJoinRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit('join-room', { userId: user!.id, roomId });
    socket.once('room-updated', (room: Room) => {
      setCurrentRoom(room);
      navigate(`/room/${room.id}`);
    });
  };

  const handleLogout = () => {
    disconnectSocket();
    setUser(null);
    setCurrentRoom(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen grid-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cyber-primary text-glow-cyan mb-2">
              游戏大厅
            </h1>
            <p className="text-gray-400">欢迎回来, {user?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg text-cyber-danger hover:bg-cyber-danger/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyber-primary" />
            房间列表
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyber-primary text-cyber-bg font-bold rounded-lg btn-neon hover:shadow-neon-cyan transition-all"
          >
            <Plus className="w-5 h-5" />
            创建房间
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.length === 0 ? (
            <div className="col-span-full glass-card rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-cyber-primary/50 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无可用房间</p>
              <p className="text-gray-500">点击上方按钮创建第一个房间吧!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="glass-card rounded-xl p-6 hover:border-cyber-primary/50 transition-all cursor-pointer group"
                onClick={() => handleJoinRoom(room.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-cyber-warning" />
                    <h3 className="text-lg font-bold text-white group-hover:text-cyber-primary transition-all">
                      {room.name}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    room.player2 ? 'bg-cyber-danger/20 text-cyber-danger' : 'bg-cyber-accent/20 text-cyber-accent'
                  }`}>
                    {room.player2 ? '已满' : '等待中'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>房主: {room.player1?.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-cyber-primary/30 flex items-center justify-center text-xs text-cyber-primary border-2 border-cyber-bg">
                        {room.player1?.username[0].toUpperCase()}
                      </div>
                      {room.player2 && (
                        <div className="w-8 h-8 rounded-full bg-cyber-secondary/30 flex items-center justify-center text-xs text-cyber-secondary border-2 border-cyber-bg">
                          {room.player2.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {room.player2 ? '2/2' : '1/2'} 玩家
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-cyber-primary/10">
                  <span className="text-cyber-primary text-sm opacity-0 group-hover:opacity-100 transition-all">
                    点击加入房间 →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-cyber-primary text-glow-cyan mb-6">
              创建房间
            </h2>
            <div className="mb-6">
              <label className="block text-cyber-primary text-sm mb-2">房间名称</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full px-4 py-3 bg-cyber-dark border border-cyber-primary/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary transition-all"
                placeholder="请输入房间名称"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-cyber-dark text-white rounded-lg hover:bg-cyber-card transition-all"
              >
                取消
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                className="flex-1 py-3 bg-cyber-primary text-cyber-bg font-bold rounded-lg btn-neon hover:shadow-neon-cyan transition-all disabled:opacity-50"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
