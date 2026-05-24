import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Skull, Home, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { getSocket, disconnectSocket } from '../utils/socket';
import { GameBoard } from '../components/GameBoard';
import { NextPiece } from '../components/NextPiece';
import { GameInfo } from '../components/GameInfo';
import {
  initGameState,
  rotatePiece,
  isValidPosition,
  mergePieceToBoard,
  clearLines,
  calculateScore,
  addGarbageLines,
  getRandomPiece,
  createEmptyBoard,
} from '../utils/tetrisEngine';
import { PieceType, BOARD_WIDTH, BOARD_HEIGHT } from '../../shared/types';

export const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, currentRoom } = useAppStore();
  const gameLoopRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState(() => initGameState());
  const [opponentBoard, setOpponentBoard] = useState<number[][]>(createEmptyBoard());
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentLines, setOpponentLines] = useState(0);
  const [opponentLevel, setOpponentLevel] = useState(0);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const isPlayer1 = currentRoom?.player1?.id === user?.id;
  const opponentName = isPlayer1 ? currentRoom?.player2?.username : currentRoom?.player1?.username;

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/');
      return;
    }

    const socket = getSocket();

    socket.on('opponent-update', (data: { board: number[][]; score: number; lines: number; level: number }) => {
      setOpponentBoard(data.board);
      setOpponentScore(data.score);
      setOpponentLines(data.lines);
      setOpponentLevel(data.level);
    });

    socket.on('receive-garbage', (lines: number) => {
      setGameState((prev) => ({
        ...prev,
        board: addGarbageLines(prev.board, lines),
      }));
    });

    socket.on('game-ended', ({ winnerId }: { winnerId: string; loserId: string }) => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      setGameResult(winnerId === user.id ? 'win' : 'lose');
    });

    return () => {
      socket.off('opponent-update');
      socket.off('receive-garbage');
      socket.off('game-ended');
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [user, roomId, navigate]);

  const movePiece = useCallback(
    (dx: number, dy: number) => {
      setGameState((prev) => {
        if (prev.isGameOver || isPaused) return prev;

        const newPiece = { ...prev.currentPiece, x: prev.currentPiece.x + dx, y: prev.currentPiece.y + dy };

        if (isValidPosition(prev.board, newPiece)) {
          return { ...prev, currentPiece: newPiece };
        }

        if (dy > 0) {
          const newBoard = mergePieceToBoard(prev.board, prev.currentPiece);
          const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

          const newScore = prev.score + calculateScore(linesCleared, prev.level);
          const newLines = prev.lines + linesCleared;
          const newLevel = Math.floor(newLines / 10);

          if (linesCleared > 1) {
            const socket = getSocket();
            socket.emit('send-garbage', { roomId, lines: linesCleared - 1 });
          }

          const nextPieceData = getRandomPiece();
          const newPiece = {
            ...prev.nextPiece,
            x: Math.floor((BOARD_WIDTH - prev.nextPiece.shape[0].length) / 2),
            y: 0,
          };

          if (!isValidPosition(clearedBoard, newPiece)) {
            const socket = getSocket();
            socket.emit('game-over', { roomId, userId: user!.id });
            return { ...prev, board: clearedBoard, isGameOver: true };
          }

          return {
            ...prev,
            board: clearedBoard,
            currentPiece: newPiece,
            nextPiece: nextPieceData,
            score: newScore,
            lines: newLines,
            level: newLevel,
          };
        }

        return prev;
      });
    },
    [isPaused, roomId, user]
  );

  const rotate = useCallback(() => {
    setGameState((prev) => {
      if (prev.isGameOver || isPaused) return prev;

      const rotated = rotatePiece(prev.currentPiece);
      if (isValidPosition(prev.board, rotated)) {
        return { ...prev, currentPiece: rotated };
      }

      const kicks = [-1, 1, -2, 2];
      for (const kick of kicks) {
        const kickedPiece = { ...rotated, x: rotated.x + kick };
        if (isValidPosition(prev.board, kickedPiece)) {
          return { ...prev, currentPiece: kickedPiece };
        }
      }

      return prev;
    });
  }, [isPaused]);

  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (prev.isGameOver || isPaused) return prev;

      let newPiece = { ...prev.currentPiece };
      while (isValidPosition(prev.board, newPiece, 0, 1)) {
        newPiece = { ...newPiece, y: newPiece.y + 1 };
      }

      const newBoard = mergePieceToBoard(prev.board, newPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      const newScore = prev.score + calculateScore(linesCleared, prev.level);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10);

      if (linesCleared > 1) {
        const socket = getSocket();
        socket.emit('send-garbage', { roomId, lines: linesCleared - 1 });
      }

      const nextPieceData = getRandomPiece();
      const spawnPiece = {
        ...prev.nextPiece,
        x: Math.floor((BOARD_WIDTH - prev.nextPiece.shape[0].length) / 2),
        y: 0,
      };

      if (!isValidPosition(clearedBoard, spawnPiece)) {
        const socket = getSocket();
        socket.emit('game-over', { roomId, userId: user!.id });
        return { ...prev, board: clearedBoard, isGameOver: true };
      }

      return {
        ...prev,
        board: clearedBoard,
        currentPiece: spawnPiece,
        nextPiece: nextPieceData,
        score: newScore,
        lines: newLines,
        level: newLevel,
      };
    });
  }, [isPaused, roomId, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameResult) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused((p) => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotate, hardDrop, gameResult]);

  useEffect(() => {
    if (gameState.isGameOver || isPaused || gameResult) return;

    const speed = Math.max(100, 1000 - gameState.level * 100);
    let lastTime = 0;

    const loop = (timestamp: number) => {
      if (timestamp - lastTime >= speed) {
        movePiece(0, 1);
        lastTime = timestamp;

        const socket = getSocket();
        socket.emit('board-update', {
          roomId,
          userId: user!.id,
          board: gameState.board,
          score: gameState.score,
          lines: gameState.lines,
          level: gameState.level,
          isGameOver: gameState.isGameOver,
        });
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.level, gameState.board, gameState.score, gameState.lines, isPaused, movePiece, roomId, user, gameResult]);

  const handleBackToLobby = () => {
    const socket = getSocket();
    socket.emit('leave-room', { userId: user!.id, roomId });
    navigate('/lobby');
  };

  const currentPieceForDisplay = {
    type: gameState.currentPiece.type as PieceType,
    x: gameState.currentPiece.x,
    y: gameState.currentPiece.y,
  };

  return (
    <div className="min-h-screen grid-bg p-4 flex flex-col items-center justify-center">
      {gameResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-12 text-center max-w-md">
            {gameResult === 'win' ? (
              <>
                <Trophy className="w-24 h-24 text-cyber-warning mx-auto mb-6 animate-bounce" />
                <h2 className="text-4xl font-bold text-cyber-warning text-glow-cyan mb-4">
                  胜利!
                </h2>
                <p className="text-gray-300 mb-2">恭喜你赢得了这场比赛!</p>
                <p className="text-cyber-primary text-2xl font-bold">最终得分: {gameState.score}</p>
              </>
            ) : (
              <>
                <Skull className="w-24 h-24 text-cyber-danger mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-cyber-danger mb-4">失败</h2>
                <p className="text-gray-300 mb-2">很遗憾，你输了这场比赛</p>
                <p className="text-cyber-primary text-2xl font-bold">最终得分: {gameState.score}</p>
              </>
            )}
            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={handleBackToLobby}
                className="flex items-center gap-2 px-6 py-3 bg-cyber-primary text-cyber-bg font-bold rounded-lg btn-neon hover:shadow-neon-cyan transition-all"
              >
                <Home className="w-5 h-5" />
                返回大厅
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-cyber-secondary text-white font-bold rounded-lg hover:shadow-neon-purple transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                再来一局
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-cyber-primary text-glow-cyan mb-6">
        俄罗斯方块对战
      </h1>

      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-4">
          <NextPiece pieceType={gameState.nextPiece.type as PieceType} />
          <GameInfo score={gameState.score} lines={gameState.lines} level={gameState.level} />
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-cyber-primary text-sm font-bold mb-2 text-center">操作说明</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>← → 左右移动</p>
              <p>↑ 旋转方块</p>
              <p>↓ 加速下落</p>
              <p>空格 直接落下</p>
              <p>P 暂停游戏</p>
            </div>
          </div>
        </div>

        <GameBoard
          board={gameState.board}
          currentPiece={currentPieceForDisplay}
          label={`${user?.username} (你)`}
        />

        <div className="flex items-center">
          <div className="text-4xl text-cyber-primary animate-pulse">VS</div>
        </div>

        <div className="flex flex-col gap-4">
          <GameBoard board={opponentBoard} isOpponent label={`${opponentName || '对手'}`} />
          <div className="glass-card rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">分数</p>
                <p className="text-lg font-bold text-cyber-secondary">{opponentScore}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">消行</p>
                <p className="text-lg font-bold text-cyber-secondary">{opponentLines}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">等级</p>
                <p className="text-lg font-bold text-cyber-secondary">{opponentLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPaused && !gameResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-cyber-primary text-glow-cyan mb-4">
              游戏暂停
            </h2>
            <p className="text-gray-400">按 P 键继续游戏</p>
          </div>
        </div>
      )}
    </div>
  );
};
