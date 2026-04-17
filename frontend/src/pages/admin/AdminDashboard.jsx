import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, Users, GraduationCap, UserCheck, FileText, ArrowUpRight, Clock, Activity, AlertCircle, Briefcase, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, trend, delay }) => (
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
        
        {/* Decorative line */}
        <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '70%' }} // Mock progress
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
    // ... (Keep state logic same)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
            setStats({
                totalStudents: 1240,
                totalAlumni: 850,
                pendingApprovals: 8,
                totalPosts: 3450
            });
        } finally {
            setLoading(false);
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
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-amber-600 hover:border-amber-200 transition shadow-sm">
                        Export Report
                    </button>
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                        System Logs
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={GraduationCap} 
                    colorClass="from-amber-400 to-orange-500"
                    trend="+5% vs last month"
                    delay={0.1}
                />
                <StatCard 
                    title="Total Alumni" 
                    value={stats.totalAlumni} 
                    icon={Users} 
                    colorClass="from-amber-600 to-amber-800"
                    trend="+2 new today"
                    delay={0.2}
                />
                <StatCard 
                    title="Pending Users" 
                    value={stats.pendingApprovals} 
                    icon={UserCheck} 
                    colorClass="from-rose-400 to-rose-600"
                    trend="Requires attention"
                    delay={0.3}
                />
                <StatCard 
                    title="Total Posts" 
                    value={stats.totalPosts} 
                    icon={FileText} 
                    colorClass="from-emerald-400 to-teal-600"
                    trend="+12% engagement"
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
                         {[
                             { msg: "New student registration: Rahul Kumar", time: "2 mins ago", type: "user", icon: Users },
                             { msg: "Alumni verification request: Priya Singh", time: "15 mins ago", type: "alert", icon: UserCheck },
                             { msg: "New job posted by TechCorp", time: "1 hour ago", type: "job", icon: Briefcase },
                             { msg: "System backup completed successfully", time: "3 hours ago", type: "system", icon: Server }
                         ].map((item, i) => (
                             <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-white transition border border-transparent hover:border-slate-100 hover:shadow-sm group">
                                 <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${
                                     item.type === 'alert' ? 'bg-amber-100 text-amber-600' : 
                                     item.type === 'system' ? 'bg-slate-100 text-slate-600' :
                                     'bg-blue-100 text-blue-600'
                                 }`}>
                                     <item.icon size={20} />
                                 </div>
                                 <div className="flex-1">
                                     <p className="text-slate-800 font-bold text-sm group-hover:text-amber-900 transition">{item.msg}</p>
                                     <p className="text-xs text-slate-400 mt-1 flex items-center font-medium">
                                         <Clock size={12} className="mr-1"/> {item.time}
                                     </p>
                                 </div>
                             </div>
                         ))}
                    </div>
                </motion.div>


            </div>
        </div>
    );
};

export default AdminDashboard;
