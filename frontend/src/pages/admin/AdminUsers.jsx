import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, Search, Slash, CheckCircle, Shield, MoreVertical, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, student, alumni

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (id, currentStatus) => {
        try {
            await API.post(`/admin/block/${id}`);
            setUsers(users.map(u => {
                if(u.id === id) {
                    return { ...u, status: currentStatus === 'Blocked' ? 'Active' : 'Blocked' };
                }
                return u;
            }));
        } catch(err) {
            alert('Action failed');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.regNo?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTab = activeTab === 'all' || user.role === activeTab;
        const isNotPending = user.status !== 'Pending';

        return matchesSearch && matchesTab && isNotPending;
    });

    const UserCard = ({ user }) => (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 transition-all duration-300"
        >
            <div className="absolute top-4 right-4 text-slate-300">
                <Shield size={16} className={`opacity-20 ${user.role === 'admin' ? 'text-amber-500 opacity-100' : ''}`} />
            </div>

            <div className="flex items-start space-x-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl font-bold text-white shadow-lg ${
                    user.role === 'alumni' 
                    ? 'from-amber-400 to-amber-600 shadow-amber-500/20' 
                    : 'from-slate-700 to-slate-900 shadow-slate-900/20'
                }`}>
                    {(user.name || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif font-bold text-slate-800 truncate">{user.name || 'Unknown User'}</h3>
                    <p className="text-sm text-slate-500 truncate flex items-center mt-1">
                        <Mail size={12} className="mr-1.5" />
                        {user.email}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1 tracking-wide">{user.regNo}</p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex space-x-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        user.role === 'alumni' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                        {user.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                        {user.status}
                    </span>
                </div>
                
                <button 
                    onClick={() => handleToggleBlock(user.id, user.status)}
                    className={`p-2 rounded-xl transition-all ${
                        user.status === 'Active' 
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                    title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                >
                    {user.status === 'Active' ? <Slash size={18} /> : <CheckCircle size={18} />}
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">User Directory</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and monitor student and alumni accounts</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full sm:w-64 text-sm font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit mb-8">
                {['all', 'student', 'alumni'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                            activeTab === tab 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20' 
                            : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <User size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No users found matching your criteria.</p>
                </div>
            ) : (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredUsers.map(user => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default AdminUsers;
