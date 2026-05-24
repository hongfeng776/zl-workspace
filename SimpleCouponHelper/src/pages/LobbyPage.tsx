import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, LogOut, Music, UserPlus, X, Send, Bell } from 'lucide-react';
import { roomApi, authApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Room, User } from '../types';
import { io, Socket } from 'socket.io-client';

export default function LobbyPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteNotification, setInviteNotification] = useState<{ roomId: string; inviterName: string } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    if (user) {
      newSocket.emit('join-room', 'lobby', user.id);
    }

    newSocket.on('receive-invite', (data) => {
      setInviteNotification(data);
      setTimeout(() => setInviteNotification(null), 10000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    loadRooms();
    loadUsers();
  }, []);

  const loadRooms = async () => {
    try {
      const res = await roomApi.getRooms();
      setRooms(res.data);
    } catch (err) {
      console.error('加载房间失败:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await authApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('加载用户失败:', err);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    setLoading(true);
    try {
      const res = await roomApi.createRoom(newRoomName);
      navigate(`/room/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || '创建房间失败');
    } finally {
      setLoading(false);
      setShowCreateModal(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      await roomApi.joinRoom(roomId);
      navigate(`/room/${roomId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || '加入房间失败');
    }
  };

  const handleAcceptInvite = () => {
    if (inviteNotification) {
      handleJoinRoom(inviteNotification.roomId);
    }
  };

  const handleSendInvite = async (invitedUserId: string) => {
    if (!showInviteModal || !user) return;
    
    try {
      const res = await roomApi.createRoom(`${user.nickname}的歌房`);
      socket?.emit('send-invite', {
        roomId: res.data.id,
        invitedUserId,
        inviterName: user.nickname
      });
      alert('邀请已发送！');
      setShowInviteModal(false);
      navigate(`/room/${res.data.id}`);
    } catch (err) {
      console.error('发送邀请失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {inviteNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="glass rounded-2xl p-4 flex items-center gap-4 neon-border">
            <Bell className="w-6 h-6 text-neon-pink animate-pulse" />
            <div>
              <p className="font-medium">{inviteNotification.inviterName} 邀请你对战！</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAcceptInvite}
                  className="px-4 py-1 bg-primary-500 rounded-lg text-sm hover:bg-primary-600"
                >
                  接受
                </button>
                <button
                  onClick={() => setInviteNotification(null)}
                  className="px-4 py-1 bg-gray-600 rounded-lg text-sm hover:bg-gray-500"
                >
                  忽略
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="glass sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-neon-pink flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display text-gradient">对歌系统</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors"
              >
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-primary-500" />
                <span className="font-medium">{user.nickname}</span>
              </button>
            )}
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-neon-pink/20 text-neon-pink rounded-xl hover:bg-neon-pink/30 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              邀请好友
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">歌房大厅</h2>
            <p className="text-gray-400">选择一个房间开始对战，或创建自己的歌房</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-neon-pink rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 neon-border"
          >
            <Plus className="w-5 h-5" />
            创建歌房
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-700 flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">暂无房间</h3>
            <p className="text-gray-400 mb-6">创建第一个歌房，开始你的演唱之旅</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 rounded-xl font-semibold hover:bg-primary-600 transition-all"
            >
              创建歌房
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="glass rounded-2xl p-6 hover:neon-border transition-all cursor-pointer group"
                onClick={() => handleJoinRoom(room.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold group-hover:text-primary-400 transition-colors">
                    {room.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    room.status === 'waiting'
                      ? 'bg-green-500/20 text-green-400'
                      : room.status === 'playing'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {room.status === 'waiting' ? '等待中' : room.status === 'playing' ? '进行中' : '已结束'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {room.player1 && (
                      <img
                        src={room.player1.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-dark-800"
                      />
                    )}
                    {room.player2 && (
                      <img
                        src={room.player2.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-dark-800"
                      />
                    )}
                    {!room.player2 && (
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {room.player1?.nickname || '虚位以待'}
                    {room.player2 ? ` vs ${room.player2.nickname}` : ' 等待对手'}
                  </span>
                </div>

                {room.currentSong && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Music className="w-4 h-4 text-primary-400" />
                    <span>{room.currentSong.title} - {room.currentSong.artist}</span>
                  </div>
                )}

                <button
                  className="w-full mt-4 py-3 bg-primary-500/20 text-primary-400 rounded-xl font-medium hover:bg-primary-500/30 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinRoom(room.id);
                  }}
                >
                  加入房间
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">创建歌房</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  歌房名称
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="给你的歌房起个名字"
                  className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={loading || !newRoomName.trim()}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-neon-pink rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    创建歌房
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">邀请好友</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无在线用户</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium">{u.nickname}</p>
                        <p className="text-sm text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendInvite(u.id)}
                      className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      邀请
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
