'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaUsers, FaGamepad, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { signOut, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
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
        { icon: FaHome, label: 'Home', path: '/admin', angle: 95, delay: 0 },
        { icon: FaUsers, label: 'Users', path: '/admin/users', angle: 125, delay: 0.05 },
        { icon: FaGamepad, label: 'Settings', path: '/admin/settings', angle: 155, delay: 0.1 },
        { icon: FaSignOutAlt, label: 'Logout', action: handleLogout, angle: 185, delay: 0.15, isDanger: true },
    ];

    const fabVariants = {
        open: { rotate: 0 },
        closed: { rotate: 0 }
    };

    return (
        <div className="sm:hidden fixed top-8 right-8 z-[100]">
            {/* Curved Menu Items */}
            <AnimatePresence>
                {isOpen && menuItems.map((item, index) => {
                    const radius = 95; // pixels
                    const x = Math.cos((item.angle * Math.PI) / 180) * radius;
                    const y = Math.sin((item.angle * Math.PI) / 180) * radius;

                    const content = (
                        <div className="relative group">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/10 transition-all ${item.isDanger
                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                    : (item.path && pathname === item.path)
                                        ? 'bg-primary-green text-black'
                                        : 'bg-black/60 text-primary-green hover:bg-primary-green/20'
                                }`}>
                                <item.icon size={18} />
                            </div>

                            {/* Tooltip/Label */}
                            <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-white text-[10px] font-black uppercase tracking-widest rounded-md border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {item.label}
                            </div>
                        </div>
                    );

                    return (
                        <motion.div
                            key={index}
                            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                x: x,
                                y: y,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: item.delay
                                }
                            }}
                            exit={{
                                scale: 0,
                                x: 0,
                                y: 0,
                                opacity: 0,
                                transition: { duration: 0.2, delay: (menuItems.length - index) * 0.05 }
                            }}
                            className="absolute"
                        >
                            {item.path ? (
                                <Link href={item.path} onClick={() => setIsOpen(false)}>
                                    {content}
                                </Link>
                            ) : (
                                <button onClick={() => { item.action?.(); setIsOpen(false); }}>
                                    {content}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Main Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                variants={fabVariants}
                animate={isOpen ? "open" : "closed"}
                whileTap={{ scale: 0.9 }}
                className="relative w-16 h-16 rounded-full bg-primary-green text-black shadow-green-glow flex items-center justify-center z-10 border-2 border-white/10"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <FaTimes size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                        >
                            <FaBars size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
