import {
  Piece,
  PieceType,
  PIECES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  GameState,
} from '../../shared/types';

const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export function createEmptyBoard(): number[][] {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(0));
}

function getRandomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

export function createPiece(type: PieceType): Piece {
  const pieceData = PIECES[type];
  return {
    type,
    shape: pieceData.shape.map((row) => [...row]),
    x: Math.floor((BOARD_WIDTH - pieceData.shape[0].length) / 2),
    y: 0,
    color: pieceData.color,
  };
}

export function getRandomPiece(): Piece {
  return createPiece(getRandomPieceType());
}

export function rotatePiece(piece: Piece): Piece {
  const rotated = piece.shape[0].map((_, index) =>
    piece.shape.map((row) => row[index]).reverse()
  );
  return { ...piece, shape: rotated };
}

export function isValidPosition(
  board: number[][],
  piece: Piece,
  offsetX = 0,
  offsetY = 0
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export function mergePieceToBoard(board: number[][], piece: Piece): number[][] {
  const newBoard = board.map((row) => [...row]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = 1;
        }
      }
    }
  }
  return newBoard;
}

export function clearLines(board: number[][]): { newBoard: number[][]; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === 0));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  return { newBoard, linesCleared };
}

export function calculateScore(linesCleared: number, level: number): number {
  const lineScores = [0, 100, 300, 500, 800];
  return lineScores[linesCleared] * (level + 1);
}

export function addGarbageLines(board: number[][], lines: number): number[][] {
  const newBoard = [...board];
  for (let i = 0; i < lines; i++) {
    const garbageLine = Array(BOARD_WIDTH).fill(1);
    garbageLine[Math.floor(Math.random() * BOARD_WIDTH)] = 0;
    newBoard.push(garbageLine);
    newBoard.shift();
  }
  return newBoard;
}

export function initGameState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPiece: getRandomPiece(),
    nextPiece: getRandomPiece(),
    score: 0,
    lines: 0,
    level: 0,
    isGameOver: false,
  };
}

export function getBoardWithPiece(board: number[][], piece: Piece): number[][] {
  const displayBoard = board.map((row) => [...row]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          displayBoard[boardY][boardX] = 1;
        }
      }
    }
  }
  return displayBoard;
}
