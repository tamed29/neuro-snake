'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, limit, query, getDocs } from 'firebase/firestore';

export default function DiagnosticsPage() {
    const [status, setStatus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const log = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        setStatus(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    useEffect(() => {
        async function runDiagnostics() {
            log('Starting Firestore Diagnostics...', 'info');

            // 1. Check Config
            const projectId = (db as any)._databaseId.projectId;
            const databaseId = (db as any)._databaseId.database;
            log(`Target Project: ${projectId}`, 'info');
            log(`Target Database: ${databaseId}`, 'info');

            // 2. Check Auth
            const user = auth.currentUser;
            log(`Auth State: ${user ? `Logged in as ${user.email}` : 'Not logged in'}`, 'info');

            // 3. Test Public Read (usernames)
            try {
                log('Testing Public Read on /usernames/test-user...', 'info');
                const testRef = doc(db, 'usernames', 'diag-test-user-123');
                await getDoc(testRef);
                log('Public Read Test: PASSED (Permission granted)', 'success');
            } catch (err: any) {
                log(`Public Read Test: FAILED - ${err.message}`, 'error');
                log(`Error Code: ${err.code}`, 'error');
                if (err.code === 'permission-denied') {
                    log('CRITICAL: Rule evaluation failed. This means your "allow read: if true;" rule is NOT active or is being overridden.', 'error');
                }
            }

            // 4. Test Collection List
            try {
                log('Testing Collection List on /users...', 'info');
                const q = query(collection(db, 'users'), limit(1));
                await getDocs(q);
                log('Collection List Test: PASSED', 'success');
            } catch (err: any) {
                log(`Collection List Test: FAILED - ${err.message}`, 'error');
            }

            setLoading(false);
        }

        runDiagnostics();
    }, []);

    return (
        <div className="min-h-screen bg-black text-green-500 p-10 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-6 border-b border-green-900 pb-2">SYSTEM DIAGNOSTICS [FIRESTORE]</h1>

            <div className="space-y-2">
                {status.map((item, i) => (
                    <div key={i} className={`flex gap-4 ${item.type === 'error' ? 'text-red-500' :
                        item.type === 'success' ? 'text-emerald-400' : 'text-primary-green/60'
                        }`}>
                        <span className="opacity-40">[{item.time}]</span>
                        <span className="font-bold">
                            {item.type === 'error' ? '✖' : item.type === 'success' ? '✔' : 'ℹ'}
                        </span>
                        <span>{item.msg}</span>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="mt-10 animate-pulse text-primary-green">
                    RUNNING ADDITIONAL PROTOCOLS...
                </div>
            )}

            {!loading && (
                <div className="mt-12 p-6 border border-green-900/30 bg-green-900/5 rounded-xl">
                    <h2 className="text-lg font-bold mb-4">RECOMMENDED ACTIONS:</h2>
                    <ul className="list-disc list-inside space-y-2 opacity-80">
                        <li>Verify <b>snake-game-4b123</b> matches your Console Dashboard.</li>
                        <li>Ensure <b>Cloud Firestore</b> is initialized (not just "created").</li>
                        <li>Check if you have multiple database instances.</li>
                        <li>Try clicking "Publish" again in the Rules tab.</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
