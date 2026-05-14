import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { toast } from 'sonner';
import { Loader2, Users, GraduationCap, UserCheck, FileText, ArrowUpRight, Clock, Activity, AlertCircle, Briefcase, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


const StatCard = ({ title, value, icon: Icon, colorClass, trend, delay, maxValue }) => (
    <motion.div 

        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        whileHover={{ y: -5 }}
        className="glass-panel p-6 rounded-3xl relative overflow-hidden group border border-white/60 shadow-xl shadow-amber-900/5 bg-white/70"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity rounded-full blur-2xl -mr-6 -mt-6`}></div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div>
                 <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">{title}</p>
                 <h3 className="text-4xl font-serif font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg shadow-amber-900/10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
        </div>
        
        {/* Progress bar scaled to value (max 2000 for display) */}
        <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((value / (maxValue || 100)) * 100))}%` }}
                className={`h-full bg-gradient-to-r ${colorClass}`}
             />
        </div>

        {trend && (
             <div className="relative z-10 flex items-center text-xs font-bold text-emerald-600 mt-3">
                <ArrowUpRight size={14} className="mr-1" />
                {trend}
            </div>
        )}
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noticeContent, setNoticeContent] = useState('');
    const [postingNotice, setPostingNotice] = useState(false);

    const handlePostNotice = async (e) => {
        e.preventDefault();
        if (!noticeContent.trim()) return;
        setPostingNotice(true);
        try {
            await API.post('/admin/posts/notice', {
                content: noticeContent,
                type: 'notice'
            });
            toast.success('Notice posted successfully to the community feed!');
            setNoticeContent('');
        } catch (err) {
            toast.error('Failed to post notice.');
        } finally {
            setPostingNotice(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchActivity();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const res = await API.get('/admin/activity');
            setActivity(res.data);
        } catch (err) {
            console.error('Activity fetch failed', err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

    return (
        <div>
            <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Welcome back, Administrator. System is optimal.</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={GraduationCap} 
                    colorClass="from-amber-400 to-orange-500"
                    trend={`${stats.totalStudents} registered`}
                    maxValue={Math.max(stats.totalStudents, stats.totalAlumni, stats.totalPosts, 100)}
                    delay={0.1}
                />
                <StatCard 
                    title="Total Alumni" 
                    value={stats.totalAlumni} 
                    icon={Users} 
                    colorClass="from-amber-600 to-amber-800"
                    trend={`${stats.totalAlumni} alumni`}
                    maxValue={Math.max(stats.totalStudents, stats.totalAlumni, stats.totalPosts, 100)}
                    delay={0.2}
                />
                <StatCard 
                    title="Pending Users" 
                    value={stats.pendingApprovals} 
                    icon={UserCheck} 
                    colorClass="from-rose-400 to-rose-600"
                    trend={stats.pendingApprovals > 0 ? 'Requires attention' : 'All clear'}
                    maxValue={Math.max(stats.pendingApprovals, 10)}
                    delay={0.3}
                />
                <StatCard 
                    title="Total Posts" 
                    value={stats.totalPosts} 
                    icon={FileText} 
                    colorClass="from-emerald-400 to-teal-600"
                    trend={`${stats.pendingPosts ?? 0} pending review`}
                    maxValue={Math.max(stats.totalStudents, stats.totalAlumni, stats.totalPosts, 100)}
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/60 shadow-xl shadow-amber-900/5 bg-white/70"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-slate-800">Recent Activity</h3>
                        </div>
                        <button className="text-amber-600 text-sm font-bold hover:text-amber-800 transition">View All</button>
                    </div>
                    
                    <div className="space-y-4">
                         {activity.length === 0 ? (
                             <div className="text-center py-10 text-slate-400">
                                 <Activity size={32} className="mx-auto mb-2 opacity-30" />
                                 <p className="text-sm">No recent activity</p>
                             </div>
                         ) : activity.map((item, i) => {
                             const iconMap = { user: Users, job: Briefcase, post: FileText, report: AlertCircle, system: Server };
                             const IconComp = iconMap[item.type] || Activity;
                             const colorMap = { user: 'bg-blue-100 text-blue-600', job: 'bg-emerald-100 text-emerald-600', post: 'bg-amber-100 text-amber-600', report: 'bg-red-100 text-red-600', system: 'bg-slate-100 text-slate-600' };
                             return (
                                 <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-white transition border border-transparent hover:border-slate-100 hover:shadow-sm group">
                                     <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${colorMap[item.type] || 'bg-slate-100 text-slate-600'}`}>
                                         <IconComp size={20} />
                                     </div>
                                     <div className="flex-1">
                                         <p className="text-slate-800 font-bold text-sm group-hover:text-amber-900 transition">{item.msg}</p>
                                         <p className="text-xs text-slate-400 mt-1 flex items-center font-medium">
                                             <Clock size={12} className="mr-1"/> {item.time}
                                         </p>
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                </motion.div>


                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-panel rounded-3xl p-8 border border-white/60 shadow-xl shadow-amber-900/5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden"
                >
                    <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-white/10 rounded-full blur-[40px]"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <AlertCircle size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-serif font-bold">Post System Notice</h3>
                        </div>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                            Publish an official system notice to the community feed. This will bypass approval and show as "System Admin".
                        </p>
                        
                        <form onSubmit={handlePostNotice}>
                            <textarea 
                                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none h-24 mb-4 backdrop-blur-md"
                                placeholder="Type your announcement here..."
                                value={noticeContent}
                                onChange={(e) => setNoticeContent(e.target.value)}
                            ></textarea>
                            <button 
                                type="submit"
                                disabled={postingNotice || !noticeContent.trim()}
                                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {postingNotice ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Publish Notice'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
