import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  setPlayerReady,
  startGame,
  endGame,
  getRoomById,
  userSocketMap,
} from './store.js';
import { BoardUpdate, Room } from '../shared/types.js';

let io: Server;

export function initSocket(server: HttpServer): void {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('set-user', (userId: string) => {
      userSocketMap.set(userId, socket.id);
    });

    socket.on('create-room', ({ userId, roomName }: { userId: string; roomName: string }) => {
      try {
        const room = createRoom(userId, roomName);
        socket.join(room.id);
        socket.emit('room-created', room);
        io.emit('rooms-updated');
      } catch (error) {
        socket.emit('error', '创建房间失败');
      }
    });

    socket.on('join-room', ({ userId, roomId }: { userId: string; roomId: string }) => {
      const room = joinRoom(roomId, userId);
      if (room) {
        socket.join(roomId);
        io.to(roomId).emit('room-updated', room);
        io.emit('rooms-updated');
      } else {
        socket.emit('error', '加入房间失败');
      }
    });

    socket.on('leave-room', ({ userId, roomId }: { userId: string; roomId: string }) => {
      const room = leaveRoom(roomId, userId);
      socket.leave(roomId);
      if (room) {
        io.to(roomId).emit('room-updated', room);
      }
      io.emit('rooms-updated');
    });

    socket.on('ready-game', ({ userId, roomId, ready }: { userId: string; roomId: string; ready: boolean }) => {
      const room = setPlayerReady(roomId, userId, ready);
      if (room) {
        io.to(roomId).emit('room-updated', room);
      }
    });

    socket.on('start-game', ({ roomId }: { roomId: string }) => {
      const room = startGame(roomId);
      if (room) {
        io.to(roomId).emit('game-started', room);
      }
    });

    socket.on('board-update', ({ roomId, userId, ...data }: BoardUpdate & { roomId: string }) => {
      socket.to(roomId).emit('opponent-update', { userId, ...data });
    });

    socket.on('game-over', ({ roomId, userId }: { roomId: string; userId: string }) => {
      const room = getRoomById(roomId);
      if (room) {
        const winnerId = room.player1?.id === userId ? room.player2?.id : room.player1?.id;
        if (winnerId) {
          const updatedRoom = endGame(roomId, winnerId);
          if (updatedRoom) {
            io.to(roomId).emit('game-ended', { winnerId, loserId: userId });
          }
        }
      }
    });

    socket.on('send-garbage', ({ roomId, lines }: { roomId: string; lines: number }) => {
      socket.to(roomId).emit('receive-garbage', lines);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
}

export function getIo(): Server {
  return io;
}
