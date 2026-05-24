import { User, Room } from '../shared/types.js';

interface UserWithPassword extends User {
  password: string;
}

export const users = new Map<string, UserWithPassword>();
export const rooms = new Map<string, Room>();
export const userSocketMap = new Map<string, string>();

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function createUser(username: string, password: string): User {
  const id = generateId();
  const user: UserWithPassword = { id, username, password };
  users.set(id, user);
  return { id, username };
}

export function findUserByUsername(username: string): UserWithPassword | undefined {
  for (const user of users.values()) {
    if (user.username === username) {
      return user;
    }
  }
  return undefined;
}

export function findUserById(id: string): User | undefined {
  const user = users.get(id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return undefined;
}

export function createRoom(hostId: string, roomName: string): Room {
  const id = generateId();
  const host = findUserById(hostId);
  if (!host) {
    throw new Error('Host not found');
  }
  const room: Room = {
    id,
    name: roomName,
    hostId,
    player1: host,
    player1Ready: false,
    player2Ready: false,
    status: 'waiting',
  };
  rooms.set(id, room);
  return room;
}

export function getRoomsList(): Room[] {
  return Array.from(rooms.values()).filter((r) => r.status === 'waiting');
}

export function getRoomById(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function joinRoom(roomId: string, userId: string): Room | null {
  const room = rooms.get(roomId);
  const user = findUserById(userId);
  if (!room || !user) return null;
  if (room.player1 && room.player2) return null;
  if (!room.player1) {
    room.player1 = user;
  } else if (!room.player2 && room.player1.id !== userId) {
    room.player2 = user;
  }
  if (room.player1 && room.player2) {
    room.status = 'ready';
  }
  return room;
}

export function leaveRoom(roomId: string, userId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.player1?.id === userId) {
    room.player1 = room.player2;
    room.player1Ready = room.player2Ready;
    room.player2 = undefined;
    room.player2Ready = false;
    if (room.player1) {
      room.hostId = room.player1.id;
    }
  } else if (room.player2?.id === userId) {
    room.player2 = undefined;
    room.player2Ready = false;
  }
  if (!room.player1 && !room.player2) {
    rooms.delete(roomId);
    return null;
  }
  room.status = 'waiting';
  room.winner = undefined;
  return room;
}

export function setPlayerReady(roomId: string, userId: string, ready: boolean): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.player1?.id === userId) {
    room.player1Ready = ready;
  } else if (room.player2?.id === userId) {
    room.player2Ready = ready;
  }
  return room;
}

export function startGame(roomId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.status = 'playing';
  return room;
}

export function endGame(roomId: string, winnerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.status = 'finished';
  room.winner = winnerId;
  return room;
}
