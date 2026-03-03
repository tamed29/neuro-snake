import { useEffect, useRef } from 'react';
import { Direction } from '@/types/game.types';

interface SwipeHandlers {
  onSwipe: (direction: Direction) => void;
  isEnabled: boolean;
}

export const useSwipeControls = ({ onSwipe, isEnabled }: SwipeHandlers) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling when swiping on the game
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipeDistance = 25; // Slightly reduced for better responsiveness

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          onSwipe(deltaX > 0 ? 'RIGHT' : 'LEFT');
        }
      } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
          onSwipe(deltaY > 0 ? 'DOWN' : 'UP');
        }
      }

      touchStartRef.current = null;
    };

    const options = { passive: false };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe, isEnabled]);
};
