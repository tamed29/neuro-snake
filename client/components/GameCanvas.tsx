'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { THEMES } from '@/lib/themes';

const GRID_SIZE = 16;

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);
  const {
    snake, food, specialFood, obstacles, gameOver, settings, lastReplay, ghostFrameIndex
  } = useGameStore();
  const [scale, setScale] = useState(1);
  const [cellSize, setCellSize] = useState(20);

  const theme = THEMES[settings.theme] || THEMES.Cyber;

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const newCellSize = width / GRID_SIZE;
      setCellSize(newCellSize);
      setScale(window.devicePixelRatio || 1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render static layer (grid and obstacles)
  useEffect(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas || !cellSize) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = GRID_SIZE * cellSize;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, size, size);

    // Grid
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Obstacles
    ctx.fillStyle = theme.obstacle;
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      ctx.fillRect(
        obstacle.x * cellSize + 1,
        obstacle.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    }
  }, [cellSize, scale, obstacles, theme]);

  // Render dynamic layer (snake and food)
  useEffect(() => {
    const canvas = dynamicCanvasRef.current;
    if (!canvas || !cellSize) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Explicitly typed constant to help TS narrowing in closures
    const ctx: CanvasRenderingContext2D = context;

    const size = GRID_SIZE * cellSize;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Normal Food
      ctx.fillStyle = theme.food;
      ctx.shadowBlur = 10 * (cellSize / 20);
      ctx.shadowColor = theme.food;
      ctx.beginPath();
      ctx.arc(
        food.x * cellSize + cellSize / 2,
        food.y * cellSize + cellSize / 2,
        Math.max(0, cellSize / 2 - 0.5),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Special Food
      if (specialFood) {
        const timeRemaining = specialFood.expiresAt - Date.now();
        if (timeRemaining > 0) {
          const pulse = Math.sin(Date.now() / 100) * 2;
          ctx.fillStyle = theme.specialFood;
          ctx.shadowBlur = Math.max(0, (15 + pulse) * (cellSize / 20));
          ctx.shadowColor = theme.specialFood;

          const centerX = specialFood.x * cellSize + cellSize / 2;
          const centerY = specialFood.y * cellSize + cellSize / 2;
          const r = Math.max(0, cellSize / 2 - 1 + (pulse / 2));

          ctx.beginPath();
          ctx.moveTo(centerX, centerY - r);
          ctx.lineTo(centerX + r, centerY);
          ctx.lineTo(centerX, centerY + r);
          ctx.lineTo(centerX - r, centerY);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.floor(cellSize * 0.5)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(
            Math.ceil(timeRemaining / 1000).toString(),
            centerX,
            centerY + (cellSize / 5)
          );
        }
      }

      // Snake Rendering
      const { direction } = useGameStore.getState();
      const angle =
        direction === 'RIGHT' ? 0 :
          direction === 'DOWN' ? Math.PI / 2 :
            direction === 'LEFT' ? Math.PI :
              -Math.PI / 2;

      for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const isHead = i === 0;
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;

        if (isHead) {
          const headGrad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
          headGrad.addColorStop(0, '#22C55E');
          headGrad.addColorStop(1, '#16A34A');
          ctx.fillStyle = headGrad;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#22C55E';
        } else {
          const bodyGrad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
          bodyGrad.addColorStop(0, '#16A34A');
          bodyGrad.addColorStop(1, '#15803D');
          ctx.fillStyle = bodyGrad;
          ctx.shadowBlur = 0;
        }

        const radius = isHead ? cellSize / 2 : cellSize / 4;
        const padding = isHead ? 0.5 : 2.5;

        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);

        if (isHead) {
          ctx.rotate(angle);
        }

        ctx.beginPath();
        // Check for roundRect availability without explicit type casting
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(-cellSize / 2 + padding, -cellSize / 2 + padding, cellSize - (padding * 2), cellSize - (padding * 2), radius);
        } else {
          ctx.rect(-cellSize / 2 + padding, -cellSize / 2 + padding, cellSize - (padding * 2), cellSize - (padding * 2));
        }
        ctx.fill();

        if (isHead) {
          ctx.fillStyle = '#FFFFFF';
          const eyeSize = cellSize / 10;
          const eyeOffset = cellSize / 4;
          ctx.beginPath();
          ctx.arc(-eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2);
          ctx.arc(eyeOffset, -eyeOffset / 2, eyeSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Ghost Replay Rendering
      if (settings.showGhost && lastReplay && ghostFrameIndex < lastReplay.length) {
        const ghostFrame = lastReplay[ghostFrameIndex];
        if (ghostFrame) {
          const ghostSnake = ghostFrame.snake;
          for (let i = 0; i < ghostSnake.length; i++) {
            const segment = ghostSnake[i];
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#A5F3FC';
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(-cellSize / 2 + 2, -cellSize / 2 + 2, cellSize - 4, cellSize - 4, cellSize / 3);
            } else {
              ctx.rect(-cellSize / 2 + 2, -cellSize / 2 + 2, cellSize - 4, cellSize - 4);
            }
            ctx.fill();
            ctx.restore();
          }
        }
      }

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [snake, food, specialFood, cellSize, scale, theme, settings.showGhost, lastReplay, ghostFrameIndex]);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[500px] sm:max-w-none lg:max-w-[500px] aspect-square relative mx-auto rounded-xl sm:rounded-3xl border-4 border-primary-green/30 shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden transition-all duration-500 ${gameOver ? 'game-over-shake grayscale' : ''
        }`}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={staticCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <canvas
        ref={dynamicCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
