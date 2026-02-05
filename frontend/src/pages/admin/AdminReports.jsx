import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { AlertOctagon, UserX, Trash2, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await API.get('/admin/reports');
            setReports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action.replace('_', ' ')}?`)) return;

        try {
            await API.post(`/admin/reports/${id}/action`, { action });
            setReports(reports.map(r => {
                if (r.id === id) {
                    return { 
                        ...r, 
                        status: action === 'dismiss' ? 'Dismissed' : 'Resolved' 
                    };
                }
                return r;
            }));
        } catch (err) {
            alert('Action failed');
        }
    };

    const pendingReports = reports.filter(r => r.status === 'Pending');
    const resolvedReports = reports.filter(r => r.status !== 'Pending');

    return (
        <div className="max-w-6xl mx-auto">
             <div className="mb-10">
                <h1 className="text-3xl font-serif font-bold text-slate-800">Moderation Dashboard</h1>
                <p className="text-slate-500 mt-1 font-medium">Review and manage reported content.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Pending Reports */}
                <section>
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center">
                        <AlertOctagon className="mr-2 text-amber-500" /> Pending Reports ({pendingReports.length})
                    </h2>
                    
                    {pendingReports.length === 0 ? (
                        <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-slate-400">
                            No pending reports. Great job!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingReports.map(report => (
                                <motion.div 
                                    layout
                                    key={report.id} 
                                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="px-2 py-1 bg-rose-50 text-rose-700 text-xs font-bold uppercase rounded">
                                                {report.reason}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {new Date(report.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg">Reported {report.targetType}: {report.reportedUser}</h3>
                                        <p className="text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                            "{report.description || 'No description provided'}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-2 justify-center min-w-[150px]">
                                        <button 
                                            onClick={() => handleAction(report.id, 'dismiss')}
                                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition"
                                        >
                                            Dismiss
                                        </button>
                                        <button 
                                            onClick={() => handleAction(report.id, 'delete_post')}
                                            className="px-4 py-2 rounded-lg bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 transition flex items-center justify-center"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Delete Post
                                        </button>
                                        <button 
                                            onClick={() => handleAction(report.id, 'ban_user')}
                                            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-black transition flex items-center justify-center"
                                        >
                                            <UserX size={16} className="mr-2" />
                                            Ban User
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Resolved Reports History (Collapsible or just list) */}
                <section className="opacity-60 hover:opacity-100 transition-opacity">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center">
                        <CheckCircle className="mr-2 text-emerald-500" /> Resolved History
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        {resolvedReports.map(report => (
                             <div key={report.id} className="p-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50">
                                 <div>
                                    <span className={`text-xs font-bold mr-2 ${report.status === 'Dismissed' ? 'text-slate-500' : 'text-emerald-600'}`}>
                                        [{report.status}]
                                    </span>
                                    <span className="text-sm font-medium text-slate-700">
                                        Report on {report.reportedUser} for {report.reason}
                                    </span>
                                 </div>
                                 <span className="text-xs text-slate-400">{new Date(report.created_at).toLocaleDateString()}</span>
                             </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminReports;
