import { create } from 'zustand';
import { GameState, Direction, Difficulty, Position, SpecialFood, ThemeType, ControlType, GameSettings, Vector2 } from '@/types/game.types';
import { sounds } from '@/lib/sounds';

const GRID_SIZE = 20;

const STORAGE_KEY = 'snake-game-settings';

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'Professional',
  soundEnabled: true,
  controlType: 'ARROWS',
  baseSpeed: 100,
  physicsMode: true,
  showGhost: true,
};

const getInitialSpeed = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'Easy': return 150;
    case 'Normal': return 100;
    case 'Hard': return 70;
    case 'Insane': return 50;
  }
};

const generateObstacles = (difficulty: Difficulty, snake: Position[]): Position[] => {
  if (difficulty === 'Easy' || difficulty === 'Normal') return [];

  const count = difficulty === 'Hard' ? 5 : 10;
  const obstacles: Position[] = [];

  for (let i = 0; i < count; i++) {
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some((s: Position) => s.x === pos.x && s.y === pos.y) ||
      obstacles.some((o: Position) => o.x === pos.x && o.y === pos.y)
    );
    obstacles.push(pos);
  }

  return obstacles;
};

const generateFood = (snake: Position[], obstacles: Position[], existingFood?: Position): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some(s => s.x === food.x && s.y === food.y) ||
    obstacles.some(o => o.x === food.x && o.y === food.y) ||
    (existingFood && food.x === existingFood.x && food.y === existingFood.y)
  );
  return food;
};

const loadSettings = (): GameSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

interface GameStore extends GameState {
  setDirection: (direction: Direction) => void;
  startGame: (difficulty: Difficulty) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  updateGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setTheme: (theme: ThemeType) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setControlType: (type: ControlType) => void;
}

const INITIAL_SNAKE: Vector2[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const INITIAL_FOOD: Position = { x: 15, y: 10 };

export const useGameStore = create<GameStore>((set, get) => ({
  snake: INITIAL_SNAKE,
  food: INITIAL_FOOD,
  specialFood: null,
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  rotation: 0,
  velocity: 0,
  score: 0,
  highScore: 0,
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  difficulty: 'Normal',
  speed: 100,
  obstacles: [],
  combo: 0,
  maxCombo: 0,
  lastFoodTime: 0,
  multiplier: 1,
  foodEatenCount: 0,
  level: 1,
  replayRecording: [],
  ghostFrameIndex: 0,
  isRecording: false,
  settings: loadSettings(),

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    sounds.setEnabled(updated.soundEnabled);
  },

  setTheme: (theme) => get().updateSettings({ theme }),
  setSoundEnabled: (soundEnabled) => get().updateSettings({ soundEnabled }),
  setControlType: (controlType) => get().updateSettings({ controlType }),

  setDirection: (direction: Direction) => {
    const { direction: currentDir, isPlaying, isPaused } = get();
    if (!isPlaying || isPaused) return;

    // Validate direction based on current real direction to prevent self-collision
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[direction] !== currentDir) {
      set({ nextDirection: direction });
    }
  },

  setDifficulty: (difficulty: Difficulty) => {
    set({ difficulty });
  },

  startGame: (difficulty: Difficulty) => {
    const obstacles = generateObstacles(difficulty, INITIAL_SNAKE);
    const food = generateFood(INITIAL_SNAKE, obstacles);
    const initialSpeed = getInitialSpeed(difficulty);

    sounds.setEnabled(get().settings.soundEnabled);

    set({
      snake: INITIAL_SNAKE,
      food,
      specialFood: null,
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      rotation: 0,
      velocity: 0.2,
      score: 0,
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      difficulty,
      speed: initialSpeed,
      obstacles,
      combo: 0,
      maxCombo: 0,
      lastFoodTime: Date.now(),
      multiplier: 1,
      foodEatenCount: 0,
      level: 1,
      replayRecording: [],
      ghostFrameIndex: 0,
      isRecording: true,
    });
  },

  pauseGame: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  resumeGame: () => {
    set({ isPaused: false });
  },

  resetGame: () => {
    set({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      specialFood: null,
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      rotation: 0,
      velocity: 0,
      score: 0,
      isPlaying: false,
      isPaused: false,
      gameOver: false,
      speed: 100,
      obstacles: [],
      combo: 0,
      maxCombo: 0,
      lastFoodTime: 0,
      multiplier: 1,
      foodEatenCount: 0,
      level: 1,
      replayRecording: [],
      ghostFrameIndex: 0,
      isRecording: false,
    });
  },

  updateGame: () => {
    const {
      snake, food, specialFood, direction, nextDirection,
      isPlaying, isPaused, gameOver, score, highScore,
      difficulty, combo, multiplier, foodEatenCount, level,
      settings, rotation, velocity, replayRecording, isRecording,
      lastFoodTime, obstacles, speed, maxCombo, ghostFrameIndex, lastReplay
    } = get();

    if (!isPlaying || isPaused || gameOver) return;

    // Special Food Expiration
    if (specialFood && Date.now() > specialFood.expiresAt) {
      set({ specialFood: null });
    }

    let newSnake = [...snake];
    let newRotation = rotation;
    let newVelocity = velocity;
    let head = { ...newSnake[0] };

    // Anti-Gravity Physics Mode
    if (settings.physicsMode) {
      const turnSpeed = 0.15 + (level * 0.01);
      const targetRotation =
        nextDirection === 'RIGHT' ? 0 :
          nextDirection === 'DOWN' ? Math.PI / 2 :
            nextDirection === 'LEFT' ? Math.PI :
              -Math.PI / 2;

      let diff = targetRotation - newRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      newRotation += diff * turnSpeed;
      newVelocity = 0.1 + (level * 0.02);

      head.x += Math.cos(newRotation) * newVelocity;
      head.y += Math.sin(newRotation) * newVelocity;
    } else {
      // Classic Grid Mode
      switch (nextDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
    }

    // Wall Collision (Torus wrap-around for physics)
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;

    // Self Collision
    const collisionRadius = settings.physicsMode ? 0.4 : 0.8;
    const hitSelf = newSnake.slice(settings.physicsMode ? 10 : 1).some(segment =>
      Math.abs(segment.x - head.x) < collisionRadius &&
      Math.abs(segment.y - head.y) < collisionRadius
    );

    if (hitSelf) {
      sounds.playGameOver();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
      }

      const isNewBestReplay = !get().lastReplay || score > (get().lastReplay?.find(f => f.score !== undefined)?.score || 0);

      set({
        gameOver: true,
        isPlaying: false,
        isRecording: false,
        lastReplay: isNewBestReplay ? replayRecording : get().lastReplay
      });
      return;
    }

    // Head is always added
    newSnake.unshift(head);

    // Food Collision Detection
    const foodRadius = 0.8;
    const isEatingNormal = Math.abs(head.x - food.x) < foodRadius && Math.abs(head.y - food.y) < foodRadius;
    const isEatingSpecial = specialFood && Math.abs(head.x - specialFood.x) < foodRadius && Math.abs(head.y - specialFood.y) < foodRadius;
    const isEating = isEatingNormal || isEatingSpecial;

    if (isEating) {
      const now = Date.now();
      const timeSinceLastFood = now - lastFoodTime;

      let newCombo = combo;
      let newMaxCombo = maxCombo;
      let newMultiplier = multiplier;

      if (timeSinceLastFood < 3000) {
        newCombo += 1;
        newMaxCombo = Math.max(newMaxCombo, newCombo);
        newMultiplier = 1 + (newCombo * 0.5);
      } else {
        newCombo = 0;
        newMultiplier = 1;
      }

      if (isEatingSpecial) sounds.playSpecialEat();
      else sounds.playEat();

      const points = isEatingNormal ? 10 : specialFood!.value;
      const newScore = score + Math.round(points * newMultiplier);
      const newFoodEatenCount = foodEatenCount + (isEatingNormal ? 1 : 0);

      let newFood = food;
      if (isEatingNormal) {
        newFood = generateFood(newSnake.map(s => ({ x: Math.round(s.x), y: Math.round(s.y) })), obstacles, food);
      }

      let newSpecialFood = isEatingSpecial ? null : specialFood;

      // Spawn special food every 5 normal items
      if (isEatingNormal && newFoodEatenCount > 0 && newFoodEatenCount % 5 === 0) {
        const foodPos = generateFood(newSnake.map(s => ({ x: Math.round(s.x), y: Math.round(s.y) })), obstacles, newFood);
        newSpecialFood = {
          ...foodPos,
          value: 50,
          timer: 5,
          expiresAt: Date.now() + 5000,
        };
      }

      // --- ADAPTIVE DIFFICULTY (PID-Lite) ---
      const targetTime = 6000;
      const performanceError = targetTime - timeSinceLastFood;

      let newLevel = level;
      if (isEatingNormal && newFoodEatenCount % 10 === 0) {
        newLevel += 1;
      }

      const correction = Math.floor(performanceError / 200);
      let newSpeed = Math.max(30, Math.min(200, speed - correction));

      // Haptic Feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(isEatingSpecial ? 100 : 50);
      }

      set({
        score: newScore,
        highScore: Math.max(newScore, highScore),
        food: newFood,
        specialFood: newSpecialFood,
        combo: newCombo,
        maxCombo: newMaxCombo,
        multiplier: newMultiplier,
        lastFoodTime: now,
        speed: newSpeed,
        foodEatenCount: newFoodEatenCount,
        level: newLevel,
        snake: newSnake
      });
    } else {
      // Pop only if not eating
      newSnake.pop();
    }

    // Constraint-based body following for smooth physics
    if (settings.physicsMode && newSnake.length > 1) {
      for (let i = 1; i < newSnake.length; i++) {
        const prev = newSnake[i - 1];
        const curr = newSnake[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 0.8;

        if (dist > minDist) {
          const angle = Math.atan2(dy, dx);
          curr.x = prev.x + Math.cos(angle) * minDist;
          curr.y = prev.y + Math.sin(angle) * minDist;
        }
      }
    }

    // Recording logic
    let newReplayRecording = replayRecording;
    if (isRecording) {
      newReplayRecording = [...replayRecording, {
        timestamp: Date.now(),
        snake: [...newSnake],
        food: { ...food },
        score: score
      }];
    }

    // Progress ghost frame index
    let newGhostFrameIndex = ghostFrameIndex;
    if (lastReplay && ghostFrameIndex < lastReplay.length - 1) {
      newGhostFrameIndex += 1;
    }

    set({
      snake: newSnake,
      rotation: newRotation,
      velocity: newVelocity,
      replayRecording: newReplayRecording,
      direction: nextDirection,
      ghostFrameIndex: newGhostFrameIndex
    });
  },
}));
