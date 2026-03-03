import {
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { enableNetwork } from 'firebase/firestore';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface UserProfile {
    uid: string;
    username: string;
    fullName: string;
    phone: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const createUserProfile = async (uid: string, profile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt' | 'role'>) => {
    const userRef = doc(db, 'users', uid);
    const usernameRef = doc(db, 'usernames', profile.username);
    const now = Timestamp.now();

    const fullProfile: UserProfile = {
        uid,
        ...profile,
        role: 'user', // Default role
        createdAt: now,
        updatedAt: now
    };

    await setDoc(userRef, fullProfile);
    await setDoc(usernameRef, { uid });
    return fullProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        // If offline, we might still have it in cache if persistence is working
        // but if it fails completely, we return null to avoid blocking
    }
    return null;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => doc.data() as UserProfile);
};

export const deleteUserAccount = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now()
    });
};

export const ensureAdminProfile = async (uid: string, email: string) => {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || (userSnap.data() as UserProfile).role !== 'admin') {
            const now = Timestamp.now();
            await setDoc(userRef, {
                uid,
                username: 'admin_' + uid.substring(0, 5),
                fullName: 'System Admin',
                phone: 'N/A',
                email,
                role: 'admin',
                createdAt: now,
                updatedAt: now
            }, { merge: true });
        }
    } catch (error) {
        console.error('Error ensuring admin profile:', error);
    }
};

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;

        // Immediate check for offline status to avoid long Firestore timeouts
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error('NETWORK_OFFLINE: Unable to verify username availability. Please check your connection.');
        }

        try {
            const usernameRef = doc(db, 'usernames', username);
            const snap = await getDoc(usernameRef);
            return !snap.exists();
        } catch (error: any) {
            console.error(`Attempt ${attempts} - Error checking username:`, error);

            const isOfflineError = error.code === 'unavailable' ||
                error.code === 'failed-precondition' ||
                error.message?.toLowerCase().includes('offline');

            if (isOfflineError && attempts < maxAttempts) {
                // Try to force network re-enable if we think we are online
                if (typeof navigator !== 'undefined' && navigator.onLine) {
                    try { await enableNetwork(db); } catch (e) { /* ignore */ }
                }

                await sleep(1000 * Math.pow(2, attempts - 1)); // Exponential backoff: 1s, 2s
                continue;
            }

            if (isOfflineError) {
                throw new Error('NETWORK_OFFLINE: Unable to verify username availability. Please check your connection.');
            }

            if (error.code === 'permission-denied') {
                throw new Error('PERMISSION_DENIED: Firestore rules are either not deployed or restrictive. ACTION REQUIRED: Deploy client/firestore.rules to Firebase Console.');
            }

            throw error;
        }
    }

    throw new Error('NETWORK_OFFLINE: Maximum verification attempts reached.');
};
