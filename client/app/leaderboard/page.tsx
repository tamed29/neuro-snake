'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeToLeaderboard } from '@/lib/firestore';
import { LeaderboardEntry, Difficulty } from '@/types/game.types';
import { auth } from '@/lib/firebase';
import { FaTrophy, FaMedal } from 'react-icons/fa';

export default function LeaderboardPage() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<Difficulty>('Insane');
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setScores([]); // Clear old scores immediately on filter change
    const unsubscribe = subscribeToLeaderboard(
      setScores,
      filter
    );
    return () => unsubscribe();
  }, [filter]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <FaTrophy className="text-yellow-400" size={24} />;
    if (index === 1) return <FaMedal className="text-gray-300" size={24} />;
    if (index === 2) return <FaMedal className="text-amber-600" size={24} />;
    return <span className="text-primary-text/60 font-bold">#{index + 1}</span>;
  };

  return (
    <div className="min-h-screen pt-8 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 text-primary-green glow-text"
        >
          LEADERBOARD
        </motion.h1>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-8">
          {(['Easy', 'Normal', 'Hard', 'Insane'] as const).map((difficulty) => (
            <motion.button
              key={difficulty}
              onClick={() => setFilter(difficulty)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${filter === difficulty
                ? 'bg-primary-green text-black shadow-green-glow'
                : 'bg-primary-card border border-primary-border text-primary-text hover:border-primary-green'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {difficulty}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-primary-card border border-primary-border rounded-lg overflow-hidden"
        >
          {scores.length === 0 ? (
            <div className="p-12 text-center text-primary-text/60">
              No scores yet. Be the first!
            </div>
          ) : (
            <div className="divide-y divide-primary-border">
              {scores.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 flex items-center gap-4 ${user && entry.uid === user.uid
                    ? 'bg-primary-green/10 border-l-4 border-primary-green'
                    : ''
                    }`}
                >
                  <div className="w-12 flex justify-center">{getRankIcon(index)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-lg">{entry.username}</p>
                    <p className="text-sm text-primary-text/60">{entry.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-primary-green">{entry.score}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
