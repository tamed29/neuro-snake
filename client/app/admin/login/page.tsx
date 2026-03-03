'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getUserProfile } from '@/lib/user';
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

export default function AdminLoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

            // Check if user has admin role
            const profile = await getUserProfile(credential.user.uid);

            if (profile?.role === 'admin') {
                router.push('/admin');
            } else {
                // Not an admin — sign out and reject
                await auth.signOut();
                setError('Access denied. This portal is for administrators only.');
            }
        } catch (err: any) {
            console.error(err);
            setError('Invalid credentials. Please verify and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
            style={{ background: 'radial-gradient(circle at top, #0D1117 0%, #05070A 100%)' }}
        >
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full green-fade-pulse"
                style={{ background: 'rgba(74,222,128,0.04)', filter: 'blur(80px)' }}
            />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-green/30 to-transparent" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-sm"
            >
                {/* Admin Badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-primary-green/10 border border-primary-green/20 text-primary-green text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                        <FaShieldAlt size={10} />
                        Admin Portal
                    </span>
                </div>

                <div className="premium-card p-6 sm:p-8 rounded-[2rem] border border-white/5 w-full">
                    <div className="flex flex-col items-center mb-7">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 green-fade-pulse"
                            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
                        >
                            <FaShieldAlt size={24} className="text-primary-green" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-1">
                            Admin <span className="text-primary-green glow-text">Access</span>
                        </h1>
                        <p className="text-primary-text/40 text-xs text-center">
                            Restricted to authorised administrators
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-5 text-xs font-semibold text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="group relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors text-sm" />
                            <input
                                type="email"
                                placeholder="Admin Email"
                                required
                                autoComplete="username"
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/40 transition-all text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="group relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors text-sm" />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                autoComplete="current-password"
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/40 transition-all text-sm"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-bold py-4 rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 text-sm text-black"
                            style={{
                                background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
                                boxShadow: '0 0 20px rgba(74,222,128,0.15)'
                            }}
                        >
                            {loading ? 'Verifying...' : (
                                <>
                                    Enter Admin Panel <FaArrowRight size={13} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-primary-text/20 text-xs mt-6">
                    Not an admin?{' '}
                    <a href="/login" className="text-primary-green/60 hover:text-primary-green transition-colors">
                        User Login
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
