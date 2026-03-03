'use client';

import { motion } from 'framer-motion';
import { FaUsers, FaGamepad, FaTrophy, FaServer } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getAllUsers } from '@/lib/user';
import { getTopScores } from '@/lib/firestore';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGames: 0,
        topScore: 0,
        activeServers: 1, // Mock
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const users = await getAllUsers();
                const scores = await getTopScores(undefined, 1);

                setStats({
                    totalUsers: users.length,
                    totalGames: scores.length > 0 ? scores[0].score : 0, // Just a placeholder logic
                    topScore: scores.length > 0 ? scores[0].score : 0,
                    activeServers: 1,
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { icon: FaUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500' },
        { icon: FaGamepad, label: 'Highest Score', value: stats.topScore, color: 'text-primary-green' },
        { icon: FaTrophy, label: 'Hall of Fame', value: stats.topScore > 0 ? 'Active' : 'Empty', color: 'text-yellow-500' },
        { icon: FaServer, label: 'System Status', value: 'Online', color: 'text-green-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-primary-text/60">Welcome back to the Snake Game administration portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-primary-card/20 backdrop-blur-md border border-primary-border p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-black/40 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-semibold text-primary-text/40 bg-white/5 px-2 py-1 rounded">24h</span>
                        </div>
                        <h3 className="text-primary-text/60 text-sm mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-primary-card/20 backdrop-blur-md border border-primary-border p-6 rounded-2xl"
                >
                    <h3 className="text-xl font-bold text-white mb-4">System Notifications</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-primary-green/20 flex items-center justify-center text-primary-green">
                                    <FaServer size={16} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Database Backup Successful</h4>
                                    <p className="text-sm text-primary-text/60">System backup completed successfully at 04:00 AM.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-primary-card/20 backdrop-blur-md border border-primary-border p-6 rounded-2xl"
                >
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                                        <FaUsers size={14} />
                                    </div>
                                    <span className="text-sm text-white font-medium">New User Registration</span>
                                </div>
                                <span className="text-xs text-primary-text/40">2 mins ago</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
