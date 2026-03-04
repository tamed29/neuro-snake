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
      { icon: Trophy, path: '/leaderboard', label: 'Board' },
      { icon: User, path: '/profile', label: 'Profile' },
      ...(isAdmin ? [{ icon: Settings, path: '/admin', label: 'Admin' }] : []),
    ]
    : [
      { icon: LogIn, path: '/login', label: 'Login' },
      { icon: UserPlus, path: '/register', label: 'Sign Up' },
    ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="sticky top-0 left-0 right-0 z-[100] premium-card border-b border-primary-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <motion.div className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-green rounded-lg flex items-center justify-center shadow-green-glow animate-pulse flex-shrink-0">
              <Gamepad2 className="text-black" size={14} />
            </div>
            <h1 className="text-sm sm:text-2xl font-black text-white italic tracking-tighter group-hover:text-primary-green transition-colors uppercase">
              SNAKE<span className="text-primary-green">.PRO</span>
            </h1>
          </motion.div>
        </Link>

        {/* Nav Items */}
        <div className="flex gap-0.5 sm:gap-2 items-center">
          {navItems.map(({ icon: Icon, path, label }) => (
            <Link key={path} href={path}>
              <motion.div
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all text-[10px] sm:text-xs font-black uppercase tracking-wider ${pathname === path
                  ? 'bg-primary-green/10 border-primary-green text-primary-green shadow-green-glow'
                  : 'text-primary-text/60 border-transparent hover:border-white/10 hover:text-white hover:bg-white/5'
                  }`}
                whileTap={{ scale: 0.93 }}
              >
                <Icon size={14} className="sm:hidden flex-shrink-0" />
                <Icon size={16} className="hidden sm:block flex-shrink-0" />
                <span className="hidden xs:hidden sm:inline">{label}</span>
              </motion.div>
            </Link>
          ))}

          {user && (
            <motion.button
              onClick={handleLogout}
              className="ml-0.5 sm:ml-1 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-primary-text/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              whileTap={{ scale: 0.93 }}
              title="Logout"
            >
              <LogOut size={14} className="sm:hidden" />
              <LogOut size={16} className="hidden sm:block" />
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
