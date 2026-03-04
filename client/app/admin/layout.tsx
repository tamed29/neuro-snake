'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUsers, FaSignOutAlt, FaHome, FaGamepad, FaShieldAlt } from 'react-icons/fa';
import { signOut, auth } from '@/lib/firebase';
import AdminMobileNav from '@/components/AdminMobileNav';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, loading, isAdmin } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { icon: FaHome, label: 'Overview', path: '/admin' },
        { icon: FaUsers, label: 'Users', path: '/admin/users' },
        { icon: FaGamepad, label: 'Game Settings', path: '/admin/settings' },
    ];

    // Redirect non-admins to main login (must be in useEffect, never during render)
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/login');
        }
    }, [loading, isAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-primary-bg flex items-center justify-center">
                <div className="text-primary-green animate-pulse font-black italic">VERIFYING ADMIN ACCESS...</div>
            </div>
        );
    }

    // Still render nothing while redirect is pending
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-primary-bg flex font-sans">
            {/* Sidebar - Hidden on smallest screens */}
            <aside className="hidden sm:flex w-16 sm:w-64 lg:w-80 premium-card border-r border-primary-border flex-col fixed h-full z-50">
                <div className="p-4 sm:p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-8 sm:mb-12">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-green/10 border border-primary-green/20 rounded-xl flex items-center justify-center shadow-green-glow flex-shrink-0">
                            <FaShieldAlt className="text-primary-green" size={16} />
                        </div>
                        <h1 className="hidden sm:block text-xl lg:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                            ADMIN<span className="text-primary-green">.SYS</span>
                        </h1>
                    </div>

                    <nav className="space-y-2 sm:space-y-4">
                        {menuItems.map(({ icon: Icon, label, path }) => (
                            <Link key={path} href={path}>
                                <motion.div
                                    className={`flex items-center gap-3 sm:gap-4 px-2 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all border ${pathname === path
                                        ? 'bg-primary-green/10 border-primary-green/40 text-primary-green'
                                        : 'text-primary-text/40 border-transparent hover:border-white/5 hover:text-white hover:bg-white/5'
                                        }`}
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    <span className="hidden sm:block text-xs font-black uppercase tracking-[0.15em]">{label}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 sm:p-8 lg:p-10 border-t border-primary-border space-y-4">
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-primary-green flex-shrink-0">
                            <FaUsers size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-primary-text/40 uppercase tracking-widest">Operator</p>
                            <p className="text-sm font-semibold text-white truncate italic">{profile?.fullName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 sm:px-5 py-3 sm:py-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        <FaSignOutAlt size={14} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 sm:ml-16 md:ml-64 lg:ml-80 p-4 sm:p-8 lg:p-12 bg-dark-gradient min-h-screen">
                <AdminMobileNav />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
