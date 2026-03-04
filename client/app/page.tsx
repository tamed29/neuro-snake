'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Gamepad2, Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const BackgroundShaders = dynamic(() => import('@/components/BackgroundShaders'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-primary-bg" />
});

export default function Home() {
  const router = useRouter();

  const features = [
    { icon: Gamepad2, title: 'Competitive Play', desc: 'Face off against global players' },
    { icon: Trophy, title: 'Real-time Ranking', desc: 'Secure your spot on the leaderboard' },
    { icon: ShieldCheck, title: 'Secure Protocol', desc: 'Full encryption for your game data' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-primary-bg pt-8">
      <BackgroundShaders />
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary-green/5 blur-[120px] rounded-full -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10 text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary-green/5 border border-primary-green/10 mb-12 shadow-inner"
          >
            <span className="w-1.5 h-1.5 bg-primary-green rounded-full animate-pulse shadow-green-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-green/80">System Protocol 2.0.4 Online</span>
          </motion.div>

          <h1 className="text-[44px] sm:text-[72px] md:text-[140px] font-black leading-none italic tracking-tighter text-white mb-4 sm:mb-8 uppercase flex flex-col md:block">
            SNAKE <span className="text-primary-green glow-text drop-shadow-[0_0_30px_rgba(80,200,120,0.3)]">PRO</span>
          </h1>

          <p className="max-w-2xl mx-auto text-primary-text/40 text-xs sm:text-base md:text-lg font-bold leading-relaxed mb-10 sm:mb-16 italic uppercase tracking-wider">
            Industrial grade arcade mechanics.<br />
            Redefined for the elite competitive landscape.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:gap-6 w-full px-2">
            <motion.button
              onClick={() => router.push('/game')}
              className="group relative w-full sm:w-auto px-6 sm:px-14 py-3.5 sm:py-5 bg-primary-green text-black rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-xl shadow-green-glow transition-all active:scale-95 overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center justify-center gap-2">
                AUTHENTICATE & START <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="w-full sm:w-auto px-6 sm:px-12 py-3.5 sm:py-5 bg-white/[0.02] border border-white/10 text-white rounded-xl sm:rounded-[2rem] font-black text-sm sm:text-xl hover:bg-white/[0.05] hover:border-white/20 transition-all active:scale-95 uppercase italic"
            >
              Hall of Records
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-8 mt-16 sm:mt-32">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="premium-card p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-primary-border text-left group"
            >
              <div className="w-14 h-14 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center mb-8 group-hover:border-primary-green/50 transition-colors">
                <f.icon className="text-primary-green" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 italic uppercase tracking-tight">{f.title}</h3>
              <p className="text-primary-text/40 text-sm font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Background Particles Decoration (already in layout/globals, but we can add more specific) */}
      <div className="absolute inset-0 -z-20 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}
