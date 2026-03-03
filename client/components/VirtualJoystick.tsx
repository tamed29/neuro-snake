'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Direction } from '@/types/game.types';

interface VirtualJoystickProps {
    onDirectionChange: (direction: Direction) => void;
}

export default function VirtualJoystick({ onDirectionChange }: VirtualJoystickProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for the joystick knob
    const springConfig = { damping: 20, stiffness: 300 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        if (containerRef.current) {
            containerRef.current.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const maxRadius = rect.width / 2;

        let dx = e.clientX - centerX;
        let dy = e.clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxRadius) {
            dx = (dx / distance) * maxRadius;
            dy = (dy / distance) * maxRadius;
        }

        x.set(dx);
        y.set(dy);

        // Determine direction
        if (distance > 20) {
            if (Math.abs(dx) > Math.abs(dy)) {
                onDirectionChange(dx > 0 ? 'RIGHT' : 'LEFT');
            } else {
                onDirectionChange(dy > 0 ? 'DOWN' : 'UP');
            }
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        x.set(0);
        y.set(0);
    };

    return (
        <div className="flex flex-col items-center gap-4 py-8">
            <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative w-40 h-40 rounded-full glass-morphism border-2 border-white/10 flex items-center justify-center touch-none select-none shadow-inner"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                {/* Inner track */}
                <div className="absolute inset-4 rounded-full border border-primary-green/5 bg-primary-green/[0.02] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />

                {/* Joystick Knob */}
                <motion.div
                    style={{ x: springX, y: springY }}
                    className="w-16 h-16 rounded-full bg-primary-green shadow-green-glow flex items-center justify-center relative z-10"
                >
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10" />

                    {/* Glossy highlight */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/20 blur-[2px]" />
                </motion.div>

                {/* Direction indicators */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-white/10" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-white/10" />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1 w-3 rounded-full bg-white/10" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 h-1 w-3 rounded-full bg-white/10" />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-text/20 italic">
                Virtual Vector Interface
            </p>
        </div>
    );
}
