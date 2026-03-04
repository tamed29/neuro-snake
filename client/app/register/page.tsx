'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, createUserWithEmailAndPassword } from '@/lib/firebase';
import { createUserProfile, isUsernameAvailable } from '@/lib/user';
import {
    User,
    Mail,
    Lock,
    Phone,
    IdCard,
    ArrowRight,
    UserPlus,
    WifiOff,
    AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const validatePassword = (pass: string) => {
        const minLength = 8;
        const hasUpper = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        return pass.length >= minLength && hasUpper && hasNumber && hasSpecial;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('ACCESS KEYS DO NOT MATCH');
            setLoading(false);
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('KEY REQUIREMENTS: MIN 8 CHARS, 1 UPPER, 1 NUMBER, 1 SPECIAL');
            setLoading(false);
            return;
        }

        try {
            const usernameAvailable = await isUsernameAvailable(formData.username);
            if (!usernameAvailable) {
                setError('IDENTIFIER REJECTED: USERNAME ALREADY IN USE');
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            await createUserProfile(userCredential.user.uid, {
                username: formData.username,
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
            });

            // Rapid transition to login
            router.push('/login?registered=true');
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('NETWORK_OFFLINE')) {
                setError('CONNECTION FAILURE: SYSTEMS ARE OFFLINE. PLEASE RETRY IN A MOMENT.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('EMAIL ALREADY IN USE: PLEASE LOGIN OR USE ANOTHER EMAIL');
            } else {
                setError(err.message || 'PROTOCOL FAILURE: ACCOUNT CREATION ABORTED');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative bg-primary-bg overflow-hidden py-10">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary-green/[0.04] blur-[120px] rounded-full green-fade-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card p-6 sm:p-10 rounded-[2rem] border border-primary-border w-full max-w-xl relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-green/10 rounded-2xl flex items-center justify-center border border-primary-green/20 mb-5 green-fade-pulse">
                        <UserPlus size={28} className="text-primary-green" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Create <span className="text-primary-green glow-text">Account</span></h2>
                    <p className="text-primary-text/40 text-xs font-semibold text-center">Set up your profile to get started</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 flex items-center justify-center gap-3"
                    >
                        {error.includes('OFFLINE') ? <WifiOff size={18} /> : <AlertCircle size={18} />}
                        <span className="text-[11px] font-black tracking-widest italic uppercase">{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="group relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Username"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div className="group relative">
                            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="group relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="group relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="group relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-green/90 hover:bg-primary-green text-black font-bold py-4 rounded-xl shadow-green-glow hover:shadow-green-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    <UserPlus size={18} />
                                </motion.div>
                            ) : (
                                <>
                                    Create Account <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-primary-text/40">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-green hover:text-primary-green/80 ml-1 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
