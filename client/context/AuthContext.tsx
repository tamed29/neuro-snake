'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, UserProfile, ensureAdminProfile } from '@/lib/user';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            const currentPath = window.location.pathname; // Use current path for stable checks

            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    // Check if we need to elevate for admin
                    if (firebaseUser.email === 'snake1@gmail.com') {
                        // elevation logic inside ensures profile exists or is updated
                        await ensureAdminProfile(firebaseUser.uid, firebaseUser.email);
                    }

                    const userProfile = await getUserProfile(firebaseUser.uid);
                    setProfile(userProfile);

                    // Role-based routing protection
                    if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
                        if (userProfile?.role !== 'admin') {
                            router.push('/admin/login');
                        }
                    }
                } catch (error) {
                    console.error('Auth error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);

                if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
                    router.push('/admin/login');
                } else if (['/profile', '/game'].some(route => currentPath.startsWith(route))) {
                    router.push('/login');
                }
            }
        });

        return () => unsubscribe();
    }, [router]); // Reduced dependencies to avoid re-triggering logic unnecessarily

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAdmin: profile?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
