import { motion } from 'framer-motion';
import { FaRedo, FaTrophy, FaStar, FaFire, FaLayerGroup, FaAppleAlt, FaSignInAlt } from 'react-icons/fa';
import { useGameStore } from '@/store/useGameStore';
import { Difficulty } from '@/types/game.types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface GameOverSummaryProps {
    onRestart: (difficulty: Difficulty) => void;
}

export default function GameOverSummary({ onRestart }: GameOverSummaryProps) {
    const { score, highScore, foodEatenCount, level, maxCombo, difficulty } = useGameStore();
    const { user } = useAuth();
    const router = useRouter();
    const [guestGames, setGuestGames] = useState(0);
    const GUEST_LIMIT = 5;

    useEffect(() => {
        const saved = localStorage.getItem('snake_guest_games');
        if (saved) setGuestGames(parseInt(saved, 10));
    }, []);

    const isLimitReached = !user && guestGames >= GUEST_LIMIT;

    const stats = [
        { label: 'Final Yield', value: score, icon: <FaStar className="text-yellow-400" /> },
        { label: 'Peak Protocol', value: highScore, icon: <FaTrophy className="text-primary-green" /> },
        { label: 'Units Collected', value: foodEatenCount, icon: <FaAppleAlt className="text-red-500" /> },
        { label: 'Phases', value: level, icon: <FaLayerGroup className="text-blue-400" /> },
        { label: 'Max Surge', value: `x${maxCombo}`, icon: <FaFire className="text-orange-500" /> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0
            }}
            transition={{
                duration: 0.3
            }}
            className="premium-card border border-primary-border rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden mx-auto"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 blur-[60px] rounded-full -z-10" />

            <div className="text-center mb-5 sm:mb-12">
                <motion.h2
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter mb-1 sm:mb-2 uppercase leading-none"
                >
                    SESSION <br />
                    <span className="text-primary-green">TERMINATED</span>
                </motion.h2>
                <p className="text-primary-text/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 sm:mt-4">
                    Analytical Report • {difficulty}
                </p>
                {!user && (
                    <div className="mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl inline-block">
                        <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest">
                            {isLimitReached ? 'GUEST PROTOCOL DEPLETED' : `GUEST CHANCES: ${GUEST_LIMIT - guestGames} REMAINING`}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-12">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-2 sm:p-6 rounded-xl sm:rounded-3xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center ${index === 0 ? 'col-span-2 bg-primary-green/5 border-primary-green/20 py-4 sm:py-8' : ''
                            }`}
                    >
                        <div className="text-sm sm:text-xl mb-0.5 sm:mb-3 opacity-50">{stat.icon}</div>
                        <div className="text-lg sm:text-3xl font-black text-white leading-none italic tracking-tighter">{stat.value}</div>
                        <div className="text-[7px] sm:text-[9px] font-black text-primary-text/30 uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1 sm:mt-3">
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-4">
                {isLimitReached ? (
                    <motion.button
                        onClick={() => router.push('/login')}
                        className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em]"
                        whileHover={{ scale: 1.02, backgroundColor: '#f0f0f0' }}
                    >
                        <FaSignInAlt /> AUTHENTICATE TO CONTINUE
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={() => onRestart(difficulty)}
                        className="w-full py-5 sm:py-6 bg-primary-green text-black rounded-xl sm:rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-green-glow active:scale-95 transition-all uppercase tracking-[0.2em]"
                        whileHover={{ scale: 1.02 }}
                    >
                        <FaRedo size={20} /> INITIALIZE REBOOT
                    </motion.button>
                )}

                <p className="text-center text-primary-text/20 text-[9px] font-black uppercase tracking-widest mt-6">
                    Awaiting operator input...
                </p>
            </div>
        </motion.div>
    );
}
