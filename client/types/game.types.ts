export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Insane';

export type ControlType = 'ARROWS' | 'WASD';

export type ThemeType = 'Professional' | 'Cyber' | 'Forest' | 'Ocean' | 'Sunset' | 'Classic';

export interface Position {
  x: number;
  y: number;
}

// Vector-based position for physics
export interface Vector2 {
  x: number;
  y: number;
}

export interface ReplayFrame {
  timestamp: number;
  snake: Vector2[];
  food: Vector2;
  score: number;
}

export interface SpecialFood extends Position {
  value: number;
  timer: number;
  expiresAt: number;
}

export interface GameSettings {
  theme: ThemeType;
  soundEnabled: boolean;
  controlType: ControlType;
  baseSpeed: number;
  physicsMode: boolean; // Toggle for "Anti-Gravity"
  showGhost: boolean;
}

export interface GameState {
  snake: Vector2[]; // High precision positions
  food: Position;
  specialFood: SpecialFood | null;
  direction: Direction;
  nextDirection: Direction;
  rotation: number; // Current heading in radians
  velocity: number; // Current speed magnitude
  score: number;
  highScore: number;
  lastReplay?: ReplayFrame[];
  replayRecording: ReplayFrame[];
  ghostFrameIndex: number;
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  difficulty: Difficulty;
  speed: number;
  obstacles: Position[];
  combo: number;
  maxCombo: number;
  lastFoodTime: number;
  multiplier: number;
  foodEatenCount: number;
  level: number;
  settings: GameSettings;
}

export interface LeaderboardEntry {
  id?: string;
  uid: string;
  username: string;
  score: number;
  difficulty: Difficulty;
  createdAt: any;
}

export interface UserStats {
  highestScore: number;
  totalGames: number;
  averageScore: number;
  bestDifficulty: Difficulty;
}
