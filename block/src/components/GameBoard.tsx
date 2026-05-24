import React from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT, PIECES, PieceType } from '../../shared/types';

interface GameBoardProps {
  board: number[][];
  currentPiece?: { type: PieceType; x: number; y: number };
  isOpponent?: boolean;
  label: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, currentPiece, isOpponent, label }) => {
  const displayBoard = board.map((row) => [...row]);

  if (currentPiece && !isOpponent) {
    const pieceData = PIECES[currentPiece.type];
    for (let y = 0; y < pieceData.shape.length; y++) {
      for (let x = 0; x < pieceData.shape[y].length; x++) {
        if (pieceData.shape[y][x]) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = 1;
          }
        }
      }
    }
  }

  const getCellColor = (value: number): string => {
    if (value === 0) return 'bg-cyber-dark/50';
    return 'bg-cyber-primary';
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-cyber-primary mb-2 text-lg font-bold text-glow-cyan">{label}</h3>
      <div
        className={`glass-card rounded-lg p-2 ${isOpponent ? 'opacity-80' : ''}`}
        style={{
          boxShadow: isOpponent
            ? '0 0 15px rgba(168, 85, 247, 0.3)'
            : '0 0 15px rgba(0, 245, 255, 0.3)',
        }}
      >
        <div
          className="grid gap-px bg-cyber-bg"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
          }}
        >
          {displayBoard.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`tetris-cell w-5 h-5 ${getCellColor(cell)} ${cell ? 'filled' : ''}`}
                style={cell ? { boxShadow: 'inset 0 0 8px rgba(0, 245, 255, 0.5)' } : {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
