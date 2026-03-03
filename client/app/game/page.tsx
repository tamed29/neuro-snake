'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/useGameStore';
import { useSnakeEngine } from '@/hooks/useSnakeEngine';
import { useSwipeControls } from '@/hooks/useSwipeControls';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { saveScore } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/types/game.types';

// Dynamic imports for performance optimization
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false });
const SettingsPanel = dynamic(() => import('@/components/SettingsPanel'), { ssr: false });
const GameOverSummary = dynamic(() => import('@/components/GameOverSummary'), { ssr: false });
const DifficultySelector = dynamic(() => import('@/components/DifficultySelector'), { ssr: false });
const MobileControls = dynamic(() => import('@/components/MobileControls'), { ssr: false });

export default function GamePage() {
  const router = useRouter();
  const {
    isPlaying,
    isPaused,
    gameOver,
    score,
    highScore,
    difficulty,
    level,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setDirection,
    settings,
  } = useGameStore();

  const { user, profile, loading: authLoading } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Normal');
  const [guestGames, setGuestGames] = useState<number>(0);
  const GUEST_LIMIT = 5;

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('snake_guest_games');
      if (saved) setGuestGames(parseInt(saved, 10));
    }
  }, [user]);

  useSnakeEngine();
  useSwipeControls({ onSwipe: setDirection, isEnabled: isPlaying });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      const key = e.key.toLowerCase();
      const controlType = settings.controlType;

      if (controlType === 'ARROWS') {
        switch (e.key) {
          case 'ArrowUp': e.preventDefault(); setDirection('UP'); break;
          case 'ArrowDown': e.preventDefault(); setDirection('DOWN'); break;
          case 'ArrowLeft': e.preventDefault(); setDirection('LEFT'); break;
          case 'ArrowRight': e.preventDefault(); setDirection('RIGHT'); break;
        }
      } else if (controlType === 'WASD') {
        switch (key) {
          case 'w': e.preventDefault(); setDirection('UP'); break;
          case 's': e.preventDefault(); setDirection('DOWN'); break;
          case 'a': e.preventDefault(); setDirection('LEFT'); break;
          case 'd': e.preventDefault(); setDirection('RIGHT'); break;
        }
      }

      if (e.key === ' ') {
        e.preventDefault();
        if (isPaused) resumeGame();
        else pauseGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isPaused, gameOver, setDirection, pauseGame, resumeGame, settings.controlType]);

  useEffect(() => {
    if (gameOver && score > 0 && user && profile) {
      const username = profile.username || user.displayName || user.email || 'Anonymous';
      saveScore(user.uid, username, score, difficulty);
    }
  }, [gameOver, score, user, profile, difficulty]);

  const handleStart = () => {
    if (!user) {
      if (guestGames >= GUEST_LIMIT) {
        router.push('/login?message=limit_reached');
        return;
      }
      const newCount = guestGames + 1;
      setGuestGames(newCount);
      localStorage.setItem('snake_guest_games', newCount.toString());
    }
    startGame(selectedDifficulty);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 transition-all duration-700 bg-[#0B0F14]">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
          <div className="flex flex-col items-center">
            {/* Header Area */}
            <div className="w-full flex justify-end items-center mb-6 px-4">
              <div className="flex items-center gap-3">
                <SettingsPanel />
              </div>
            </div>

            {/* Game Canvas Container - Simplified to remove 'double box' effect */}
            <div className="relative w-full transition-all duration-500">
              <GameCanvas />

              <AnimatePresence>
                {isPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20"
                  >
                    <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="text-center">
                      <h2 className="text-6xl font-black text-white italic mb-8 tracking-tighter">PAUSED</h2>
                      <button
                        onClick={resumeGame}
                        className="px-16 py-5 bg-primary-green text-black rounded-2xl font-black text-2xl shadow-green-glow hover:scale-110 transition-transform active:scale-95"
                      >
                        RESUME
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-30 px-4"
                  >
                    <GameOverSummary onRestart={startGame} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Controls */}
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 w-full max-w-sm"
              >
                <MobileControls onDirectionChange={setDirection} />
              </motion.div>
            )}
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-6">
            <AnimatePresence mode="wait">
              {!isPlaying && !gameOver ? (
                <motion.div
                  key="start-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-primary-card border border-primary-border rounded-3xl p-8 shadow-xl"
                >
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-green rounded-full shadow-[0_0_10px_#22C55E]" />
                    READY TO START?
                  </h3>
                  <div className="space-y-4">
                    <DifficultySelector
                      selected={selectedDifficulty}
                      onSelect={setSelectedDifficulty}
                    />
                    <button
                      onClick={handleStart}
                      className="w-full mt-4 py-5 bg-primary-green text-black rounded-2xl font-black text-xl shadow-green-glow hover:brightness-110 transition-all active:scale-95"
                    >
                      START
                    </button>
                  </div>
                  {!user && (
                    <div className="mt-6 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Guest Session</p>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold italic">{GUEST_LIMIT - guestGames} Chances Remaining</span>
                        <div className="flex gap-1">
                          {Array.from({ length: GUEST_LIMIT }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${i < guestGames ? 'bg-orange-500/20' : 'bg-orange-500 animate-pulse'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-8 text-[11px] text-primary-text/40 space-y-2 font-medium tracking-wide border-t border-primary-border pt-6">
                    <p className="flex justify-between"><span>MOVE</span> <span className="text-white">ARROWS / WASD</span></p>
                    <p className="flex justify-between"><span>PAUSE</span> <span className="text-white">SPACE</span></p>
                    <p className="flex justify-between"><span>SWIPE</span> <span className="text-white">TOUCH ENABLED</span></p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="active-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="premium-card border border-primary-border rounded-3xl p-8 shadow-xl space-y-8"
                >
                  <div className="flex justify-between items-end border-b border-primary-border pb-6">
                    <div>
                      <p className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.2em] mb-2">Score Pulse</p>
                      <p className="text-5xl font-black text-primary-green leading-none glow-text tracking-tighter italic">{score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.2em] mb-2">Best Session</p>
                      <p className="text-2xl font-black text-white leading-none tracking-tighter italic">{Math.max(score, highScore)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-5 rounded-[1.5rem] border border-white/5 text-center">
                      <p className="text-[9px] font-black text-primary-text/20 uppercase mb-2 tracking-[0.1em]">Level</p>
                      <p className="text-2xl font-black text-white italic">{level}</p>
                    </div>
                    <div className="bg-black/40 p-5 rounded-[1.5rem] border border-white/5 text-center">
                      <p className="text-[9px] font-black text-primary-text/20 uppercase mb-2 tracking-[0.1em]">Phase</p>
                      <p className="text-2xl font-black text-primary-green italic truncate uppercase tracking-tighter">{difficulty}</p>
                    </div>
                  </div>

                  <button
                    onClick={resetGame}
                    className="w-full py-4 border border-red-500/10 text-red-500/40 rounded-2xl font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-[10px] tracking-[0.2em] active:scale-95 uppercase"
                  >
                    Terminate Protocol
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </div>
  );
}
