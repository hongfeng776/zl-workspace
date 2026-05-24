export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  player1: User | null;
  player2: User | null;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  currentSong: Song | null;
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  lyrics?: LyricLine[];
  audioUrl?: string;
}

export interface LyricLine {
  time: number;
  text: string;
  pitch: number;
}

export interface ScoreDetail {
  total: number;
  pitch: number;
  rhythm: number;
  energy: number;
  lyrics: number;
}

export interface Battle {
  id: string;
  roomId: string;
  songId: string;
  player1: User | null;
  player2: User | null;
  song: Song | null;
  player1Score?: ScoreDetail;
  player2Score?: ScoreDetail;
  winner?: User | null;
  player1AudioUrl?: string;
  player2AudioUrl?: string;
  createdAt: string;
}

export interface AudioRecord {
  battleId: string;
  songTitle: string;
  audioUrl: string;
  createdAt: string;
}

export interface BattleHistory {
  id: string;
  song: { title: string; artist: string } | null;
  opponent: User | null;
  isWinner: boolean;
  score: number;
  createdAt: string;
}
