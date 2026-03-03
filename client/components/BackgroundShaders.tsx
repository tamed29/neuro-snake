'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

function StarField() {
    const ref = useRef<THREE.Points>(null);
    const isPlaying = useGameStore(state => state.isPlaying);
    const velocity = useGameStore(state => state.velocity);
    const level = useGameStore(state => state.level);

    const [positions, colors] = useMemo(() => {
        const count = 500; // Further reduced for performance
        const pos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

            const mix = Math.random();
            cols[i * 3] = 0.0;
            cols[i * 3 + 1] = mix > 0.5 ? 0.8 : 0.4; // Slightly dimmer green
            cols[i * 3 + 2] = mix > 0.8 ? 0.6 : 0.1;
        }
        return [pos, cols];
    }, []);

    useFrame((state: any, delta: number) => {
        if (!ref.current) return;

        const speed = isPlaying ? (velocity * 1.5 + level * 0.05) : 0.03;
        ref.current.rotation.y += delta * speed * 0.15;
        ref.current.rotation.x += delta * speed * 0.08;

        const time = state.clock.getElapsedTime();
        ref.current.position.z = Math.sin(time * 0.4) * 0.08;
    });

    return (
        <Points ref={ref} positions={positions} colors={colors}>
            <PointMaterial
                transparent
                vertexColors
                size={0.012}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

export default function BackgroundShaders() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="absolute inset-0 bg-primary-bg" />;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30 transition-opacity duration-1000">
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
                <StarField />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-bg/10 to-primary-bg" />
        </div>
    );
}
