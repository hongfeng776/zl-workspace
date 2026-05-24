export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  player1?: User;
  player2?: User;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  player1Ready: boolean;
  player2Ready: boolean;
  winner?: string;
}

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Piece {
  type: PieceType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

export interface GameState {
  board: number[][];
  currentPiece: Piece;
  nextPiece: Piece;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
}

export interface BoardUpdate {
  userId: string;
  board: number[][];
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const PIECES: Record<PieceType, { shape: number[][]; color: string }> = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f5ff',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffff00',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a855f7',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#22c55e',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ef4444',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#3b82f6',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f97316',
  },
};
