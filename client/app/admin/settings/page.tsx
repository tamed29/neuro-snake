'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaGamepad, FaClock, FaSkull, FaChartBar, FaLock, FaKey } from 'react-icons/fa';
import { updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        defaultSpeed: 100,
        bonusChance: 15,
        maxLives: 3,
        maintenanceMode: false,
        globalMultiplier: 1.0,
    });

    // Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

    const handleSave = () => {
        // Logic to save settings to Firestore
        alert('Settings saved successfully (simulated)');
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: 'Passwords do not match.', type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                await updatePassword(user, newPassword);
                setPasswordMessage({ text: 'Password successfully updated!', type: 'success' });
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ text: 'Authentication error. Please re-login.', type: 'error' });
            }
        } catch (error: any) {
            console.error('Password update error:', error);
            if (error.code === 'auth/requires-recent-login') {
                setPasswordMessage({ text: 'Security requirement: Please log out and back in to change your password.', type: 'error' });
            } else {
                setPasswordMessage({ text: 'Failed to update password. Try again.', type: 'error' });
            }
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Game Control <span className="text-primary-green">Engine</span></h2>
                <p className="text-primary-text/40 text-xs font-bold tracking-[0.2em] mt-2">Adjust global parameters and system state.</p>
            </div>

            <div className="grid gap-6">
                {/* Core Mechanics */}
                <div className="premium-card rounded-3xl p-8 border border-primary-border">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <FaGamepad className="text-primary-green" />
                        Core Mechanics
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary-text/40 uppercase tracking-widest">Default Tick Rate (ms)</label>
                            <input
                                type="number"
                                value={settings.defaultSpeed}
                                onChange={(e) => setSettings({ ...settings, defaultSpeed: parseInt(e.target.value) })}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-green transition-colors font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary-text/40 uppercase tracking-widest">Bonus Spawn Chance (%)</label>
                            <input
                                type="number"
                                value={settings.bonusChance}
                                onChange={(e) => setSettings({ ...settings, bonusChance: parseInt(e.target.value) })}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-green transition-colors font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* System State */}
                <div className="premium-card rounded-3xl p-8 border border-primary-border">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <FaChartBar className="text-blue-500" />
                        Economy & Scoring
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary-text/40 uppercase tracking-widest">Score Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.globalMultiplier}
                                onChange={(e) => setSettings({ ...settings, globalMultiplier: parseFloat(e.target.value) })}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-green transition-colors font-mono"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                            <div>
                                <p className="text-sm font-bold text-white uppercase italic">Maintenance Mode</p>
                                <p className="text-[10px] text-primary-text/30 font-medium">Disable game entry for users</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                className={`w-14 h-7 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-8' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="premium-card rounded-3xl p-8 border border-primary-border">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <FaLock className="text-red-500" />
                        Admin Security
                    </h3>

                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                        {passwordMessage.text && (
                            <div className={`p-3 rounded-xl text-xs font-semibold ${passwordMessage.type === 'error'
                                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    : 'bg-primary-green/10 border border-primary-green/20 text-primary-green'
                                }`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary-text/40 uppercase tracking-widest flex items-center gap-2">
                                <FaKey size={10} /> New Admin Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary-text/40 uppercase tracking-widest flex items-center gap-2">
                                <FaKey size={10} /> Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all w-full md:w-auto mt-2!"
                        >
                            Update Password
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex justify-end">
                <motion.button
                    onClick={handleSave}
                    className="bg-primary-green text-black px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-green-glow hover:scale-105 transition-transform uppercase tracking-widest"
                    whileTap={{ scale: 0.95 }}
                >
                    <FaSave size={18} />
                    Save Protocol
                </motion.button>
            </div>
        </div>
    );
}
