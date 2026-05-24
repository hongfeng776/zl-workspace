import React from 'react';
import { PieceType, PIECES } from '../../shared/types';

interface NextPieceProps {
  pieceType: PieceType;
}

export const NextPiece: React.FC<NextPieceProps> = ({ pieceType }) => {
  const piece = PIECES[pieceType];

  return (
    <div className="glass-card rounded-lg p-4">
      <h3 className="text-cyber-primary mb-3 text-sm font-bold text-center">下一个</h3>
      <div className="flex justify-center">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
            gridTemplateRows: `repeat(${piece.shape.length}, 1fr)`,
          }}
        >
          {piece.shape.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`w-5 h-5 ${cell ? 'bg-cyber-primary' : 'bg-transparent'}`}
                style={cell ? { boxShadow: '0 0 8px rgba(0, 245, 255, 0.6)' } : {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
