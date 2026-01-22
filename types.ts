
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface PlayerCar extends GameObject {
  targetX: number;
}

export interface Obstacle extends GameObject {
  type: 'truck' | 'car' | 'pothole';
  color: string;
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  speed: number;
  commentary: string;
  lastCommentaryScore: number;
}
