import React from 'react';

interface GameInfoProps {
  score: number;
  lines: number;
  level: number;
}

export const GameInfo: React.FC<GameInfoProps> = ({ score, lines, level }) => {
  return (
    <div className="glass-card rounded-lg p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-cyber-primary text-sm font-bold mb-1">分数</h3>
        <p className="text-2xl font-bold text-white text-glow-cyan">{score}</p>
      </div>
      <div className="text-center">
        <h3 className="text-cyber-primary text-sm font-bold mb-1">消行</h3>
        <p className="text-xl font-bold text-cyber-secondary">{lines}</p>
      </div>
      <div className="text-center">
        <h3 className="text-cyber-primary text-sm font-bold mb-1">等级</h3>
        <p className="text-xl font-bold text-cyber-accent">{level}</p>
      </div>
    </div>
  );
};
