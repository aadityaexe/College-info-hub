import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, CheckCircle, XCircle, Search, Clock, Award, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPending = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await API.get('/admin/pending-users');
            setPendingUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, name) => {
        if (!window.confirm(`Are you sure you want to approve ${name}?`)) return;
        try {
            await API.post(`/admin/approve/${id}`);
            setPendingUsers(pendingUsers.filter(u => u.id !== id));
            // Optional: Show toast
        } catch (err) {
            alert('Failed to approve user.');
        }
    };

    const handleReject = async (id, name) => {
        if (!window.confirm(`Reject registration for ${name}?`)) return;
        try {
            await API.post(`/admin/reject/${id}`);
            setPendingUsers(pendingUsers.filter(u => u.id !== id));
        } catch (err) {
            alert('Failed to reject user.');
        }
    };

    const filteredUsers = pendingUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.reg_no || user.regNo)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const PendingCard = ({ user }) => (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 relative overflow-hidden"
        >
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                        user.role === 'alumni' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-indigo-500/20' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20'
                    }`}>
                        {(user.name || '?').charAt(0)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'alumni' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                        {user.role}
                    </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-slate-800 mb-1">{user.name || 'Unknown User'}</h3>
                <p className="text-sm text-slate-500 mb-4 font-medium">{user.email}</p>

                <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center text-sm text-slate-600">
                        <Award size={16} className="mr-2 text-slate-400" />
                        <span className="font-semibold">{user.course}</span> 
                        <span className="mx-1">•</span> 
                        <span>{user.batch}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                         <GraduationCap size={16} className="mr-2 text-slate-400" />
                         <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200">{user.reg_no || user.regNo}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-400">
                        <Clock size={14} className="mr-2" />
                        Requested: {new Date().toLocaleDateString()}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleReject(user.id, user.name)}
                        className="flex items-center justify-center py-2.5 rounded-xl border border-rose-100 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-colors"
                    >
                        <XCircle size={18} className="mr-2" /> Reject
                    </button>
                    <button 
                        onClick={() => handleApprove(user.id, user.name)}
                        className="flex items-center justify-center py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:-translate-y-0.5"
                    >
                        <CheckCircle size={18} className="mr-2" /> Approve
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-serif font-bold text-slate-800">Pending Approvals</h1>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">{filteredUsers.length} New</span>
                    </div>
                    <p className="text-slate-500 font-medium">Review and verify new registration requests</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search requests..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full sm:w-64 text-sm font-medium shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-300">
                        <CheckCircle size={32} />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">All Caught Up!</p>
                    <p className="text-slate-400 text-sm mt-1">No pending approvals at the moment.</p>
                </div>
            ) : (
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {filteredUsers.map(user => (
                            <PendingCard key={user.id} user={user} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default AdminPending;
