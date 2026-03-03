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
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const userProfile = await getUserProfile(firebaseUser.uid);

                    // Pre-flight Admin Elevation for specific account
                    if (firebaseUser.email === 'snake1@gmail.com') {
                        await ensureAdminProfile(firebaseUser.uid, firebaseUser.email);
                        // Refresh profile after elevation if it was missing or not admin
                        if (!userProfile || userProfile.role !== 'admin') {
                            const updatedProfile = await getUserProfile(firebaseUser.uid);
                            setProfile(updatedProfile);
                        } else {
                            setProfile(userProfile);
                        }
                    } else {
                        setProfile(userProfile);
                    }

                    // Role-based routing protection - ONLY after profile is loaded
                    // /admin/login is a public page, skip protection
                    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                        const finalProfile = firebaseUser.email === 'snake1@gmail.com' ? (await getUserProfile(firebaseUser.uid)) : userProfile;
                        if (finalProfile?.role !== 'admin') {
                            router.push('/admin/login');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    setProfile(null);
                    // If profile fetch fails for an admin route, redirect to admin login
                    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                        router.push('/admin/login');
                    }
                }
            } else {
                setProfile(null);
                // Protection for user-only routes
                // /admin/login is public - don't redirect it
                const protectedRoutes = ['/profile'];
                if (protectedRoutes.some(route => pathname.startsWith(route))) {
                    router.push('/login');
                }
                // Admin routes (except /admin/login) redirect to admin login
                if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

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
