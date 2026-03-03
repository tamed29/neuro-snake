'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScorePanel() {
  const { score, combo, multiplier, difficulty } = useGameStore();

  return (
    <div className="premium-card border border-primary-border rounded-3xl p-8 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.2em] mb-2">Score Pulse</p>
          <motion.p
            key={score}
            initial={{ scale: 1.1, color: '#00FF66' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            className="text-5xl font-black text-white italic tracking-tighter leading-none"
          >
            {score}
          </motion.p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.2em] mb-2">Phase</p>
          <p className="text-xl font-black text-primary-green italic tracking-tighter uppercase">{difficulty}</p>
        </div>
      </div>

      <AnimatePresence>
        {combo > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mt-6 p-4 bg-primary-green/5 border border-primary-green/20 rounded-2xl flex items-center justify-between"
          >
            <div className="flex flex-col">
              <p className="text-[9px] font-black text-primary-green uppercase tracking-[0.1em]">Combustion</p>
              <p className="text-lg font-black text-white italic tracking-tighter">x{combo}</p>
            </div>
            <div className="text-right flex flex-col">
              <p className="text-[9px] font-black text-primary-green uppercase tracking-[0.1em]">Yield</p>
              <p className="text-lg font-black text-white italic tracking-tighter">x{multiplier.toFixed(1)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
