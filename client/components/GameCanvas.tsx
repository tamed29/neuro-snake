'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { THEMES } from '@/lib/themes';

const GRID_SIZE = 20;

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
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const newCellSize = Math.floor(width / GRID_SIZE);
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
    obstacles.forEach((obstacle) => {
      ctx.fillRect(
        obstacle.x * cellSize + 1,
        obstacle.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    });
  }, [cellSize, scale, obstacles, settings.theme]);

  // Render dynamic layer (snake and food)
  useEffect(() => {
    const canvas = dynamicCanvasRef.current;
    if (!canvas || !cellSize) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = GRID_SIZE * cellSize;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Radial Gradient Mask for the grid (Fog of War depth)
      const head = snake[0];
      if (head) {
        const hx = head.x * cellSize + cellSize / 2;
        const hy = head.y * cellSize + cellSize / 2;
        const maskSize = cellSize * 12;

        ctx.save();
        ctx.beginPath();
        const maskGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, maskSize);
        maskGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        maskGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = maskGrad;
        ctx.arc(hx, hy, maskSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'destination-in';
        // This is tricky because we want to mask the STATIC grid, not the dynamic layer.
        // For now, let's just use it to fade the dynamic elements slightly or 
        // we'll move the grid rendering here if needed.
        ctx.restore();
      }

      // Normal Food
      ctx.fillStyle = theme.food;
      ctx.shadowBlur = 10 * (cellSize / 20);
      ctx.shadowColor = theme.food;
      ctx.beginPath();
      ctx.arc(
        food.x * cellSize + cellSize / 2,
        food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
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
          ctx.shadowBlur = (15 + pulse) * (cellSize / 20);
          ctx.shadowColor = theme.specialFood;

          const centerX = specialFood.x * cellSize + cellSize / 2;
          const centerY = specialFood.y * cellSize + cellSize / 2;
          const r = cellSize / 2 - 1 + (pulse / 2);

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

      // Snake Rendering (Smooth Vector Positions)
      snake.forEach((segment, index) => {
        const isHead = index === 0;
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;

        const gradient = ctx.createRadialGradient(
          x + cellSize / 2,
          y + cellSize / 2,
          0,
          x + cellSize / 2,
          y + cellSize / 2,
          cellSize / 2
        );

        if (isHead) {
          gradient.addColorStop(0, theme.snakeHead[0]);
          gradient.addColorStop(1, theme.snakeHead[1]);
          ctx.shadowBlur = 25 * (cellSize / 20);
          ctx.shadowColor = theme.snakeHead[0];
        } else {
          gradient.addColorStop(0, theme.snakeBody[0]);
          gradient.addColorStop(1, theme.snakeBody[1]);
          ctx.shadowBlur = 10 * (cellSize / 20);
          ctx.shadowColor = 'rgba(0, 255, 102, 0.1)';
        }

        ctx.fillStyle = gradient;

        const radius = isHead ? cellSize / 2.5 : cellSize / 3;
        const padding = 1;

        // Phantom Trail Effect (Motion Blur)
        if (settings.physicsMode && index > 0 && index < 5) {
          ctx.save();
          ctx.globalAlpha = 0.1 / index;
          ctx.fillStyle = theme.snakeBody[0];
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);

        // Add rotation to the head if in physics mode
        if (isHead && settings.physicsMode) {
          const { rotation } = useGameStore.getState();
          ctx.rotate(rotation);
        }

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-cellSize / 2 + padding, -cellSize / 2 + padding, cellSize - (padding * 2), cellSize - (padding * 2), radius);
        } else {
          ctx.rect(-cellSize / 2 + padding, -cellSize / 2 + padding, cellSize - (padding * 2), cellSize - (padding * 2));
        }
        ctx.fill();

        if (isHead) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FFFFFF';
          ctx.fillStyle = '#FFFFFF';
          const eyeSize = cellSize / 8;
          const eyeOffset = cellSize / 4;
          ctx.beginPath();
          ctx.arc(-eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
          ctx.arc(eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Ghost Replay Rendering
      if (settings.showGhost && lastReplay && lastReplay.length > ghostFrameIndex) {
        const ghostFrame = lastReplay[ghostFrameIndex];
        if (ghostFrame) {
          ghostFrame.snake.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            ctx.save();
            ctx.globalAlpha = 0.15; // Very faint ghost
            // Cyan/Blue ghost for contrast
            ctx.fillStyle = '#A5F3FC';
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(-cellSize / 2 + 2, -cellSize / 2 + 2, cellSize - 4, cellSize - 4, cellSize / 3);
            } else {
              ctx.rect(-cellSize / 2 + 2, -cellSize / 2 + 2, cellSize - 4, cellSize - 4);
            }
            ctx.fill();
            ctx.restore();
          });
        }
      }

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [snake, food, specialFood, cellSize, scale, settings.theme, settings.showGhost, lastReplay, ghostFrameIndex]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[500px] aspect-square relative mx-auto"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={staticCanvasRef}
        className={`absolute inset-0 rounded-lg border-2 border-primary-border w-full h-full transition-all duration-500 ${gameOver ? 'game-over-shake grayscale' : ''
          }`}
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
