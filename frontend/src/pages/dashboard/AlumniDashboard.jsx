import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, MessageCircle, Star, ArrowRight, CheckCircle, Clock, Calendar, X, Send, Trash2 } from 'lucide-react';
import { fetchIncomingRequests } from '../../features/mentorship/mentorshipSlice';
import { fetchJobs, createJob, deleteJob } from '../../features/jobs/jobsSlice';

const PostJobModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ title: '', company: '', location: '', type: 'Full-time', description: '' });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative border border-white/60 shadow-2xl bg-white/95"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"></div>
                
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition">
                    <X size={20} />
                </button>
                
                <div className="mb-8">
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Post a Job</h2>
                    <p className="text-slate-500 font-medium">Find the perfect candidate from our alumni network.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                        <input 
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium"
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company</label>
                            <input 
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium"
                                placeholder="Your Company"
                                value={formData.company}
                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Job Type</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Internship</option>
                                    <option>Contract</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 4.5L6 8L9.5 4.5"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                        <input 
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium"
                            placeholder="e.g. Remote / New York"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium resize-none placeholder-slate-400"
                            placeholder="Key responsibilities and requirements..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="mr-3 px-6 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-bold transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5 flex items-center"
                        >
                            <Briefcase size={18} className="mr-2" />
                            Post Job
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="glass-panel p-6 rounded-2xl border border-white/60 shadow-xl shadow-amber-900/5 bg-white/60 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:opacity-20 transition-opacity`}></div>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-lg`}>
            <Icon size={24} />
        </div>
        <h3 className="text-4xl font-serif font-bold text-slate-800 mb-1">{value}</h3>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wide">{label}</p>
    </motion.div>
);

const AlumniDashboard = () => {
    const dispatch = useDispatch();
    const { incomingRequests } = useSelector(state => state.mentorship);
    const { jobs } = useSelector(state => state.jobs);
    const { user } = useSelector(state => state.auth);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        dispatch(fetchIncomingRequests());
        dispatch(fetchJobs());
    }, [dispatch]);

    const handleCreateJob = (jobData) => {
        dispatch(createJob({ ...jobData, posted_by: user.name }))
            .then(() => {
                setIsJobModalOpen(false);
                setSuccessMsg('Job Posted Successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
            });
    };

    const handleDeleteJob = (jobId) => {
        if (confirm('Are you sure you want to remove this job posting?')) {
            dispatch(deleteJob(jobId))
                .then(() => {
                     setSuccessMsg('Job Removed Successfully');
                     setTimeout(() => setSuccessMsg(''), 3000);
                });
        }
    };

    const pendingRequests = incomingRequests.filter(req => req.status === 'Pending');
    const acceptedRequests = incomingRequests.filter(req => req.status === 'Accepted');
    
    // In real app, filter by posted_by === user.name
    // Here we assume "My Jobs" are just the ones created in this session or all for demo
    // Let's filter by if posted_by matches or just show top 5 for demo control
    // Since mock posts store 'posted_by', let's TRY to filter if possible, else show all.
    const myJobs = jobs.filter(j => j.posted_by === user?.name || j.posted_by === 'You' || !j.posted_by); 

    return (
        <div>
            <PostJobModal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} onSubmit={handleCreateJob} />
            
            {/* Success Toast */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-24 right-8 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center font-bold border-2 border-emerald-400"
                    >
                        <CheckCircle size={24} className="mr-3" />
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-10 text-center md:text-left">
                <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-2 block">Welcome Back</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">{user?.name || 'Alumni'}</h1>
                <p className="text-slate-500 mt-2 md:mt-3 text-base md:text-lg max-w-2xl mx-auto md:mx-0">Manage your mentorships, post opportunities, and connect with the next generation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={Users} label="Students Mentored" value={acceptedRequests.length} color="from-amber-400 to-orange-500" />
                <StatCard icon={MessageCircle} label="Pending Requests" value={pendingRequests.length} color="from-rose-400 to-pink-600" />
                <StatCard icon={Briefcase} label="Jobs Posted" value={myJobs.length} color="from-emerald-400 to-teal-500" />
                <StatCard icon={Star} label="Reputation Score" value="4.9" color="from-violet-400 to-indigo-600" />
            </div>

             <div className="grid lg:grid-cols-3 gap-8 mb-8">
                 <div className="lg:col-span-2 space-y-8">
                     {/* Pending Requests */}
                     <div className="glass-panel rounded-3xl p-8 border border-white/60 bg-white/70 shadow-xl shadow-amber-900/5">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <h2 className="text-2xl font-serif font-bold text-slate-800">Pending Requests</h2>
                            <Link to="/alumni/mentorship" className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center bg-amber-50 px-4 py-2 rounded-lg transition">
                                Manage Requests <ArrowRight size={16} className="ml-2"/>
                            </Link>
                        </div>
                        {pendingRequests.length === 0 ? (
                            <div className="p-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <MessageCircle size={32}/>
                                </div>
                                <p className="text-slate-500 font-medium">No new requests pending.</p>
                                <p className="text-slate-400 text-sm mt-1">Check back later or update your profile availability.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.slice(0, 3).map(req => (
                                    <div key={req.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition group">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                                                {req.student_name ? req.student_name.charAt(0) : 'S'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{req.student_name || 'Student Request'}</h4>
                                                <p className="text-sm text-slate-500 truncate max-w-[200px] sm:max-w-xs font-medium">{req.message}</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                            <Clock size={12} className="mr-1"/> Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>

                     {/* Active Mentorships */}
                     <div className="glass-panel rounded-3xl p-8 border border-white/60 bg-white/70 shadow-xl shadow-amber-900/5">
                        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-6">Active Mentorships</h2>
                        {acceptedRequests.length === 0 ? (
                             <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium">You haven't accepted any mentees yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {acceptedRequests.map(req => (
                                    <div key={req.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center space-x-4 shadow-sm hover:border-amber-200 transition">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {req.student_name ? req.student_name.charAt(0) : 'S'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{req.student_name}</h4>
                                            <button className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center mt-1">
                                                <MessageCircle size={12} className="mr-1"/> Send Message
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                 </div>
                 
                 <div className="space-y-8">
                     {/* Quick Actions */}
                     <div className="glass-panel rounded-3xl p-8 border border-white/60 bg-white/70 shadow-lg shadow-amber-900/5">
                          <h2 className="text-xl font-serif font-bold text-slate-800 mb-6">Quick Actions</h2>
                          <div className="grid grid-cols-1 gap-4">
                              <button 
                                onClick={() => setIsJobModalOpen(true)}
                                className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition text-left group flex items-center bg-white"
                              >
                                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform text-amber-600">
                                      <Briefcase size={22} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">Post a Job</h4>
                                      <p className="text-xs text-slate-500 font-medium mt-0.5">Hire from campus</p>
                                  </div>
                              </button>
                               <button className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition text-left group flex items-center bg-white">
                                  <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform text-orange-600">
                                      <Users size={22} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">Update Profile</h4>
                                      <p className="text-xs text-slate-500 font-medium mt-0.5">Showcase expertise</p>
                                  </div>
                              </button>
                          </div>
                     </div>

                     {/* Upcoming Events */}
                     <div className="glass-panel rounded-3xl p-8 border border-white/60 bg-white/70 shadow-lg shadow-amber-900/5">
                        <h2 className="text-xl font-serif font-bold text-slate-800 mb-6">Upcoming Events</h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-14 text-center bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
                                    <span className="block text-xs font-bold text-red-500 uppercase">Feb</span>
                                    <span className="block text-xl font-black text-slate-800">15</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base leading-tight">Annual Alumni Meet</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium mb-2">5:00 PM • Main Auditorium</p>
                                    <button className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg hover:bg-amber-100 transition">RSVP Now</button>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-14 text-center bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
                                    <span className="block text-xs font-bold text-red-500 uppercase">Mar</span>
                                    <span className="block text-xl font-black text-slate-800">02</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base leading-tight">Mentorship Mixer</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium mb-2">10:00 AM • Virtual Event</p>
                                    <button className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg hover:bg-amber-100 transition">Join Link</button>
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
             
             <div className="mt-8 glass-panel rounded-3xl p-8 border border-white/60 bg-white/70 shadow-xl shadow-amber-900/5">
                <h2 className="text-2xl font-serif font-bold text-slate-800 mb-8">Manage Posted Jobs</h2>
                {myJobs.length === 0 ? (
                     <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Briefcase size={40} className="mx-auto text-slate-300 mb-3"/>
                        <p className="text-slate-500 font-medium">You haven't posted any jobs yet.</p>
                        <button onClick={() => setIsJobModalOpen(true)} className="mt-3 text-amber-600 font-bold hover:underline">Post your first opportunity</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myJobs.map(job => (
                            <div key={job.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex justify-between items-start shadow-sm hover:shadow-lg hover:border-amber-200 transition duration-300 group">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg mb-1">{job.title}</h4>
                                    <p className="text-sm text-slate-500 font-medium mb-3">{job.company} • {job.location}</p>
                                    <div className="flex items-center space-x-2 text-xs font-bold">
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{job.type}</span>
                                        <span className="text-slate-400 font-medium pb-0.5">Posted {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently'}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                    title="Delete Job"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
};

export default AlumniDashboard;
