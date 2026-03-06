'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Gamepad2, Chrome, Github, ArrowRight } from 'lucide-react';
import { auth, googleProvider, githubProvider, signInWithPopup, signInWithEmailAndPassword } from '@/lib/firebase';
import { createUserProfile, getUserProfile, ensureAdminProfile } from '@/lib/user';

function LoginContent() {
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get('registered') === 'true';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Prevent attempting user login with known admin email up front
            if (!isAdminLogin && formData.email === 'snake@gmail.com') {
                throw new Error('Administrators must log in via the Admin Login portal.');
            }

            const credential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

            if (isAdminLogin && formData.email === 'snake@gmail.com') {
                await ensureAdminProfile(credential.user.uid, formData.email);
            }

            // Optimization: Trigger redirect immediately. AuthContext will handle the final safety check.
            if (isAdminLogin) {
                router.push('/admin');
            } else {
                router.push('/game');
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid credentials. Please verify and try again.');
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: any) => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if profile exists, if not create it
            const profile = await getUserProfile(user.uid);
            if (!profile) {
                const username = user.displayName ? user.displayName.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000) : 'user' + Math.floor(Math.random() * 1000);
                await createUserProfile(user.uid, {
                    username,
                    fullName: user.displayName || 'Social User',
                    phone: '',
                    email: user.email || '',
                });
            }

            // Route admins to admin dashboard, regular users to game
            if (profile?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/game');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Social login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative bg-primary-bg overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-primary-green/[0.04] blur-[100px] rounded-full green-fade-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card p-6 sm:p-10 rounded-[2rem] border border-primary-border w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-green/10 border border-primary-green/30 rounded-2xl flex items-center justify-center mb-5 green-fade-pulse">
                        <Gamepad2 size={28} className="text-primary-green" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
                        {isAdminLogin ? 'Admin' : 'User'} <span className="text-primary-green glow-text">Login</span>
                    </h2>
                    <p className="text-primary-text/40 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                        {isAdminLogin ? 'For administrators only' : 'Sign in to your account'}
                    </p>
                </div>

                {isRegistered && !error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary-green/10 border border-primary-green/20 text-primary-green p-3 rounded-xl mb-6 text-xs font-semibold text-center"
                    >
                        Registration successful! Please log in.
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-xs font-semibold text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="group relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30 group-focus-within:text-primary-green transition-colors w-4 h-4" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
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
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-white placeholder:text-primary-text/25 focus:outline-none focus:border-primary-green/50 transition-all text-sm"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-green/90 hover:bg-primary-green text-black font-bold py-4 rounded-xl shadow-green-glow hover:shadow-green-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 text-sm uppercase italic"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                Sign In <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </form>

                {!isAdminLogin && (
                    <>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-[#0D1117] px-4 text-primary-text/20 font-bold">Sign in with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSocialLogin(googleProvider)}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white text-xs font-bold transition-colors"
                            >
                                <Chrome size={16} className="text-primary-green" /> Google
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSocialLogin(githubProvider)}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white text-xs font-bold transition-colors"
                            >
                                <Github size={16} className="text-primary-green" /> GitHub
                            </motion.button>
                        </div>
                    </>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                    {!isAdminLogin && (
                        <p className="text-xs text-primary-text/40">
                            New here?{' '}
                            <Link href="/register" className="text-primary-green hover:text-primary-green/80 ml-1 font-semibold transition-colors uppercase tracking-wider">
                                Register now
                            </Link>
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdminLogin(!isAdminLogin);
                            setError('');
                        }}
                        className="text-[10px] uppercase tracking-widest text-primary-text/40 hover:text-primary-green transition-colors font-bold"
                    >
                        {isAdminLogin ? 'Switch to User Log In' : 'Admin Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-primary-bg overflow-hidden relative">
                <div className="absolute inset-0 z-0 bg-primary-bg" />
                <div className="w-16 h-16 bg-primary-green/10 border border-primary-green/30 rounded-2xl flex items-center justify-center green-fade-pulse relative z-10">
                    <Gamepad2 size={28} className="text-primary-green px-0.5" />
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
