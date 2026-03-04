'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const particles = useMemo(() => {
        if (!mounted) return [];
        // Reduce particles for better loading performance (30 -> 15)
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            duration: `${10 + Math.random() * 20}s`,
            delay: `${Math.random() * 5}s`,
        }));
    }, [mounted]);

    return (
        <AuthProvider>
            <div className="particles-bg">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: p.left,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                        }}
                    />
                ))}
            </div>
            <Navbar />
            <main className="relative z-10">{children}</main>
        </AuthProvider>
    );
}
