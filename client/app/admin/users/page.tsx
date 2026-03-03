'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaUserShield, FaSearch } from 'react-icons/fa';
import { getAllUsers, deleteUserAccount, updateUserProfile, UserProfile } from '@/lib/user';

export default function UserManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleDelete = async (uid: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUserAccount(uid);
                setUsers(users.filter((u) => u.uid !== uid));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleRoleToggle = async (user: UserProfile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            await updateUserProfile(user.uid, { role: newRole });
            setUsers(users.map((u) => (u.uid === user.uid ? { ...u, role: newRole } : u)));
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">User Management</h2>
                    <p className="text-primary-text/60">View and manage all registered user accounts.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-text/40" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-primary-card/20 border border-primary-border rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-primary-green transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-primary-card/20 backdrop-blur-md border border-primary-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-primary-border bg-white/5">
                                <th className="px-6 py-4 text-sm font-semibold text-primary-text/60">User</th>
                                <th className="px-6 py-4 text-sm font-semibold text-primary-text/60">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-primary-text/60 space-x-2">Role</th>
                                <th className="px-6 py-4 text-sm font-semibold text-primary-text/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-border">
                            <AnimatePresence>
                                {filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user.uid}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-green/20 flex items-center justify-center text-primary-green font-bold">
                                                    {user.fullName[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{user.fullName}</div>
                                                    <div className="text-xs text-primary-text/40">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-primary-text/80">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleToggle(user)}
                                                    className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 transition-colors hover:text-black"
                                                    title="Toggle Admin Role"
                                                >
                                                    <FaUserShield size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.uid)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 transition-colors hover:text-black"
                                                    title="Delete User"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {loading && (
                        <div className="p-20 text-center text-primary-text/40 animate-pulse">
                            Loading users...
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="p-20 text-center text-primary-text/40">
                            No users found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
