'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Gamepad2, Trophy, User, LogOut, LogIn, UserPlus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { signOut, auth } from '@/lib/firebase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = user
    ? [
      { icon: Gamepad2, path: '/game', label: 'Game' },
      { icon: Trophy, path: '/leaderboard', label: 'Leaderboard' },
      { icon: User, path: '/profile', label: 'Profile' },
      ...(isAdmin ? [{ icon: Settings, path: '/admin', label: 'Admin' }] : []),
    ]
    : [
      { icon: LogIn, path: '/login', label: 'Login' },
      { icon: UserPlus, path: '/register', label: 'Register' },
    ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] premium-card border-b border-primary-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <motion.div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center shadow-green-glow animate-pulse">
              <Gamepad2 className="text-black" />
            </div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter group-hover:text-primary-green transition-colors uppercase">
              SNAKE<span className="text-primary-green">.PRO</span>
            </h1>
          </motion.div>
        </Link>
        <div className="flex gap-4 items-center">
          {navItems.map(({ icon: Icon, path, label }) => (
            <Link key={path} href={path}>
              <motion.div
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-3 border ${pathname === path
                  ? 'bg-primary-green/10 border-primary-green text-primary-green shadow-green-glow'
                  : 'text-primary-text/60 border-transparent hover:border-white/10 hover:text-white hover:bg-white/5'
                  }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
              </motion.div>
            </Link>
          ))}

          {user && (
            <motion.button
              onClick={handleLogout}
              className="p-3 rounded-xl text-primary-text/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <LogOut size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
