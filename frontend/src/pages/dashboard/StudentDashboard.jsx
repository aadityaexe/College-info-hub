import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Bell, Search, Briefcase, ExternalLink, MessageCircle, ThumbsUp } from 'lucide-react';
import { fetchJobs } from '../../features/jobs/jobsSlice';
import { fetchPosts } from '../../features/posts/postsSlice';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        whileHover={{ y: -5 }}
        className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-white/60 shadow-xl shadow-amber-900/5"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity rounded-full blur-2xl -mr-8 -mt-8`}></div>
        
        <div className="relative z-10">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-lg opacity-90 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-800 mb-1">{value}</h3>
            <p className="text-slate-500 font-medium text-sm tracking-wide">{label}</p>
        </div>
    </motion.div>
);

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { jobs } = useSelector(state => state.jobs);
    const { posts } = useSelector(state => state.posts);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchJobs());
        dispatch(fetchPosts());
    }, [dispatch]);

    const recentJobs = jobs.slice(0, 3);
    const recentPosts = posts.slice(0, 3);

    return (
        <div>
            <div className="mb-10 flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">Welcome, {user?.name?.split(' ')[0] || user?.username || 'Student'}</h1>
                    <p className="text-slate-500 mt-2 md:mt-3 text-base md:text-lg font-light">Your academic dashboard is ready.</p>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-right hidden sm:block"
                >
                     <p className="text-xs text-slate-400 mt-2 font-serif italic">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={Briefcase} label="Active Jobs" value={jobs.length} color="from-blue-500 to-blue-600" delay={0.1} />
                <StatCard icon={MessageCircle} label="Community Posts" value={posts.length} color="from-amber-500 to-amber-600" delay={0.2} />
                <StatCard icon={TrendingUp} label="Profile Views" value="48" color="from-emerald-500 to-emerald-600" delay={0.3} />
                <StatCard icon={Bell} label="Notifications" value="3" color="from-red-500 to-red-600" delay={0.4} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Community Feed Preview */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 space-y-8"
                >
                    <div className="glass-panel rounded-2xl p-8 border border-white/60 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-serif font-bold text-slate-800">Community Highlights</h2>
                            <Link to="/student/feed" className="text-amber-700 text-sm font-bold hover:text-amber-800 flex items-center transition">
                                View Feed <ExternalLink size={16} className="ml-1"/>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentPosts.map(post => (
                                <div key={post.id} className="p-6 rounded-2xl bg-white/50 border border-slate-100 hover:border-amber-200 hover:bg-white hover:shadow-lg hover:shadow-amber-500/5 transition duration-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shadow-sm">
                                                {post.author ? post.author.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-800 text-sm block">{post.author}</span>
                                                <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">{post.content}</p>
                                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
                                        <span className="flex items-center hover:text-amber-600 transition"><ThumbsUp size={14} className="mr-1"/> {post.likes_count || 0} Likes</span>
                                        <span className="flex items-center hover:text-amber-600 transition"><MessageCircle size={14} className="mr-1"/> {post.comments?.length || 0} Comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Sidebar: Recommended Jobs */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-8"
                >
                    <div className="glass-panel rounded-2xl p-8 sticky top-24 border border-white/60 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-slate-800">Recommended Jobs</h2>
                            <Link to="/student/jobs" className="text-slate-400 hover:text-amber-600 transition bg-slate-50 p-2 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-200"><Search size={20}/></Link>
                        </div>
                        <div className="space-y-4">
                            {recentJobs.map(job => (
                                <div key={job.id} className="p-5 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition cursor-pointer border border-transparent hover:border-amber-100 group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/0 to-amber-500/5 rounded-bl-3xl -mr-4 -mt-4 transition-all group-hover:from-amber-500/0 group-hover:to-amber-500/10"></div>
                                    
                                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-amber-700 transition relative z-10">{job.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 relative z-10">{job.company}</p>
                                    <div className="flex items-center mt-3 relative z-10">
                                        <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full group-hover:border-amber-200 group-hover:text-amber-700 transition">{job.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <Link to="/student/jobs" className="block mt-6 text-center text-sm font-bold text-amber-700 hover:text-amber-800 transition">
                            View all opportunities
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;
