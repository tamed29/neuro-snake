import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export const useSnakeEngine = () => {
  const { isPlaying, isPaused, speed, updateGame } = useGameStore();
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!isPlaying || isPaused) return;

      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;

      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= speed) {
        updateGame();
        lastUpdateRef.current = timestamp - (elapsed % speed);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      lastUpdateRef.current = 0;
    };
  }, [isPlaying, isPaused, speed, updateGame]);
};
