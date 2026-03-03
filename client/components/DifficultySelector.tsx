'use client';

import { Difficulty } from '@/types/game.types';
import { motion } from 'framer-motion';

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: Difficulty[] = ['Easy', 'Normal', 'Hard', 'Insane'];

export default function DifficultySelector({ selected, onSelect }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {difficulties.map((difficulty) => (
        <motion.button
          key={difficulty}
          onClick={() => onSelect(difficulty)}
          className={`py-4 px-6 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all border uppercase ${selected === difficulty
              ? 'bg-primary-green text-black border-primary-green shadow-green-glow'
              : 'bg-black/40 border-white/5 text-primary-text/40 hover:border-white/20 hover:text-white'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {difficulty}
        </motion.button>
      ))}
    </div>
  );
}
