'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { getUserStats } from '@/lib/firestore';
import { UserStats } from '@/types/game.types';
import { FaTrophy, FaGamepad, FaChartLine, FaStar, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadStats(user.uid);
    }
  }, [user, authLoading, router]);

  const loadStats = async (uid: string) => {
    setLoading(true);
    try {
      const userStats = await getUserStats(uid);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = () => {
    if (!stats) return 'Beginner';
    if (stats.highestScore >= 500) return 'Legend';
    if (stats.highestScore >= 300) return 'Master';
    if (stats.highestScore >= 150) return 'Expert';
    if (stats.highestScore >= 50) return 'Advanced';
    return 'Beginner';
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-green animate-pulse text-xl font-bold tracking-tighter italic">LOADING PROFILE...</div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 relative">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-10 border border-primary-border flex flex-col md:flex-row items-center gap-5 sm:gap-10"
        >
          <div className="relative">
            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-primary-green/10 rounded-full flex items-center justify-center border-2 border-primary-green shadow-green-glow animate-pulse">
              <FaUserCircle size={48} className="text-primary-green sm:hidden" />
              <FaUserCircle size={80} className="text-primary-green hidden sm:block" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary-green text-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black italic shadow-green-glow">
              Level {Math.floor((stats?.highestScore || 0) / 50) + 1}
            </div>
          </div>

          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase truncate">{profile.fullName}</h1>
              <span className="bg-white/5 border border-white/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest text-primary-text/40">@{profile.username}</span>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 px-6 py-2 bg-primary-green/5 border border-primary-green/20 rounded-2xl">
                <FaStar className="text-primary-green" size={14} />
                <span className="text-sm font-bold text-primary-green tracking-widest">{getRankBadge().toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-sm font-medium text-primary-text/60 italic">{profile.email}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { icon: FaTrophy, label: 'HIGH SCORE', value: stats?.highestScore || 0, color: 'text-primary-green' },
            { icon: FaGamepad, label: 'TOTAL GAMES', value: stats?.totalGames || 0, color: 'text-blue-500' },
            { icon: FaChartLine, label: 'AVERAGE SCORE', value: stats?.averageScore || 0, color: 'text-purple-500' },
            { icon: FaStar, label: 'BEST DIFFICULTY', value: stats?.bestDifficulty?.toUpperCase() || 'N/A', color: 'text-yellow-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="premium-card p-6 rounded-3xl border border-primary-border text-center group"
            >
              <div className={`w-12 h-12 mx-auto rounded-2xl bg-black/40 flex items-center justify-center mb-4 border border-white/5 group-hover:border-${stat.color.split('-')[1]}-500/50 transition-colors`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <p className="text-[10px] font-bold text-primary-text/30 tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
