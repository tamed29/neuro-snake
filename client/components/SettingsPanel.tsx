'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaTimes, FaVolumeUp, FaVolumeMute, FaKeyboard, FaPalette, FaRunning, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { useGameStore } from '@/store/useGameStore';
import { ThemeType, ControlType } from '@/types/game.types';

export default function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const { settings, updateSettings, isPlaying } = useGameStore();

    const themes: ThemeType[] = ['Professional', 'Cyber', 'Forest', 'Ocean', 'Sunset', 'Classic'];
    const controls: ControlType[] = ['ARROWS', 'WASD'];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-12 h-12 bg-primary-card border border-primary-border rounded-2xl hover:border-primary-green transition-all shadow-xl flex items-center justify-center group"
            >
                <FaCog size={20} className="text-primary-green group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[100] px-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="premium-card border border-primary-border rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 max-w-md w-full shadow-2xl overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5 sm:mb-10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-green/10 rounded-xl flex items-center justify-center border border-primary-green/20">
                                        <FaCog className="text-primary-green" />
                                    </div>
                                    <h2 className="text-xl sm:text-3xl font-black text-white italic tracking-tighter uppercase">Settings</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center text-primary-text/40 hover:text-white transition-colors">
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="space-y-5 sm:space-y-8 max-h-[65vh] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                                {/* Theme Selector */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <FaPalette className="text-primary-green" size={10} /> Visual Protocol
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {themes.map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => updateSettings({ theme: t })}
                                                className={`py-3 px-1 rounded-xl border text-[9px] font-black transition-all uppercase tracking-tighter ${settings.theme === t
                                                    ? 'bg-primary-green border-primary-green text-black shadow-green-glow'
                                                    : 'bg-black/40 border-white/5 text-primary-text/40 hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Control Type */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <FaKeyboard className="text-primary-green" size={10} /> Interface Link
                                    </label>
                                    <div className="flex gap-3">
                                        {controls.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => updateSettings({ controlType: c })}
                                                className={`flex-1 py-4 rounded-xl border font-black text-[10px] tracking-[0.1em] transition-all uppercase ${settings.controlType === c
                                                    ? 'bg-primary-green border-primary-green text-black shadow-green-glow'
                                                    : 'bg-black/40 border-white/5 text-primary-text/40 hover:border-white/20 hover:text-white'
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Audio Toggle */}
                                <div className="flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl group transition-all hover:border-primary-green/20">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${settings.soundEnabled ? 'text-primary-green' : 'text-primary-text/20'}`}>
                                            {settings.soundEnabled ? <FaVolumeUp size={18} /> : <FaVolumeMute size={18} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white uppercase tracking-wider">Audio Feedback</span>
                                            <span className="text-[9px] font-black text-primary-text/20 uppercase tracking-[0.1em]">Haptic & Sonic</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${settings.soundEnabled ? 'bg-primary-green shadow-green-glow' : 'bg-white/5'
                                            }`}
                                    >
                                        <motion.div
                                            animate={{ x: settings.soundEnabled ? 26 : 4 }}
                                            className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${settings.soundEnabled ? 'bg-black' : 'bg-primary-text/20'}`}
                                        />
                                    </button>
                                </div>

                                {/* Base Speed */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-primary-text/20 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <FaRunning className="text-primary-green" size={10} /> Reaction Delta
                                        </label>
                                        <span className="text-[10px] font-black text-primary-green italic">{settings.baseSpeed}ms</span>
                                    </div>
                                    <div className="relative pt-2">
                                        <input
                                            type="range"
                                            min="50"
                                            max="200"
                                            step="10"
                                            value={settings.baseSpeed}
                                            onChange={(e) => updateSettings({ baseSpeed: parseInt(e.target.value) })}
                                            className="w-full accent-primary-green h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black text-primary-text/20 uppercase tracking-[0.2em] italic">
                                        <span>Instant</span>
                                        <span>Standard</span>
                                        <span>Relaxed</span>
                                    </div>
                                </div>

                                {/* How to Play Button */}
                                <button
                                    onClick={() => setShowHowToPlay(true)}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] tracking-[0.2em] text-white hover:bg-primary-green hover:text-black hover:border-primary-green transition-all group uppercase shadow-xl"
                                >
                                    <FaInfoCircle size={14} className="group-hover:scale-110 transition-transform" /> Initialization Protocol
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* How To Play Modal */}
            <AnimatePresence>
                {showHowToPlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-[110] px-4"
                        onClick={() => setShowHowToPlay(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, x: 20 }}
                            animate={{ scale: 1, x: 0 }}
                            exit={{ scale: 0.95, x: 20 }}
                            className="premium-card border border-primary-border rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-12 max-w-lg w-full shadow-2xl space-y-6 sm:space-y-10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowHowToPlay(false)}
                                className="absolute top-10 right-10 text-primary-text/40 hover:text-white transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>

                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-green/10 rounded-2xl flex items-center justify-center border border-primary-green shadow-green-glow mb-4 sm:mb-6">
                                    <FaQuestionCircle size={24} className="text-primary-green sm:hidden" />
                                    <FaQuestionCircle size={32} className="text-primary-green hidden sm:block" />
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase mb-1 sm:mb-2">Protocol <span className="text-primary-green">Guide</span></h2>
                                <p className="text-primary-text/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Operational Instructions</p>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-[80px_1fr] gap-6 items-start">
                                    <div className="text-[10px] font-black text-primary-green bg-primary-green/5 border border-primary-green/20 py-1 px-3 rounded-full text-center uppercase tracking-tighter">Objective</div>
                                    <p className="text-primary-text/60 text-xs font-bold leading-relaxed italic">
                                        Consume nutrient units to expand your biological matrix. Avoid structural failure by bypassing nodes, perimeter boundaries, and your own tail.
                                    </p>
                                </div>

                                <div className="grid grid-cols-[80px_1fr] gap-6 items-start">
                                    <div className="text-[10px] font-black text-white bg-white/5 border border-white/10 py-1 px-3 rounded-full text-center uppercase tracking-tighter">Scoring</div>
                                    <p className="text-primary-text/60 text-xs font-bold leading-relaxed italic">
                                        • Units: +10 Pulse<br />
                                        • Surge Units: +50 Pulse (Every 5 units)<br />
                                        • Multiplier: Chain collection events for exponential yield.
                                    </p>
                                </div>

                                <div className="grid grid-cols-[80px_1fr] gap-6 items-center">
                                    <div className="text-[10px] font-black text-white bg-white/5 border border-white/10 py-1 px-3 rounded-full text-center uppercase tracking-tighter">Inputs</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                                            <p className="text-[8px] font-black text-primary-green mb-2 uppercase tracking-widest">Arrows</p>
                                            <p className="text-xs text-white">UP DOWN LEFT RIGHT</p>
                                        </div>
                                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                                            <p className="text-[8px] font-black text-primary-green mb-2 uppercase tracking-widest">WASD</p>
                                            <p className="text-xs text-white">W A S D</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-[9px] font-black text-primary-text/20 uppercase tracking-[0.2em] italic">Space Command: Suspend/Resume Session</p>
                            </div>

                            <button
                                onClick={() => setShowHowToPlay(false)}
                                className="w-full py-3 sm:py-5 bg-primary-green text-black rounded-2xl sm:rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-green-glow active:scale-95 transition-all"
                            >
                                Acknowledge & Execute
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
