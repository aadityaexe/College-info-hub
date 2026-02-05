import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../features/auth/authSlice';
import { Loader2, User, Mail, Briefcase, Award, MapPin, Share2 } from 'lucide-react';
import EditProfileModal from '../../components/EditProfileModal';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State

    useEffect(() => {
        if (!user) {
            dispatch(fetchProfile());
        }
    }, [dispatch, user]);

    if (!user) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
        <EditProfileModal user={user} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/60 shadow-2xl shadow-amber-900/10 bg-white/80 relative">
            {/* Cover Image */}
            <div className="h-48 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="px-8 pb-10 relative">
                <div className="flex flex-col md:flex-row items-end -mt-20 mb-8 relative z-10">
                     <div className="h-40 w-40 rounded-full bg-white p-1.5 shadow-xl ring-4 ring-white/50">
                         <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative group">
                             <User size={64} className="group-hover:scale-110 transition-transform duration-500"/>
                             {user.avatar && <img src={user.avatar} alt={user.name} className="absolute inset-0 w-full h-full object-cover" />}
                         </div>
                     </div>
                     <div className="md:ml-6 mt-4 md:mt-0 md:mb-2 text-center md:text-left flex-1">
                         <h1 className="text-4xl font-serif font-bold text-slate-900 mb-1">{user.name}</h1>
                         <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className="bg-amber-100/80 text-amber-800 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider border border-amber-200">{user.role}</span>
                            <span className="text-slate-500 text-sm font-medium flex items-center"><MapPin size={14} className="mr-1"/> {user.location || 'Campus'}</span>
                         </div>
                     </div>
                     <div className="mt-6 md:mt-0 flex gap-3">
                         <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">Edit Profile</button>
                         <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"><Share2 size={20}/></button>
                     </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-white/50 border border-white/60">
                            <h3 className="font-serif font-bold text-slate-800 mb-4 text-lg">Contact Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center text-slate-600 group">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                <div className="flex items-center text-slate-600 group">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                        <Briefcase size={16} />
                                    </div>
                                    <span className="text-sm font-medium">{user.department || 'Department Unlisted'}</span>
                                </div>
                                <div className="flex items-center text-slate-600 group">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                        <Award size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Member since {new Date().getFullYear()}</span>
                                </div>
                            </div>
                        </div>

                         <div className="glass-panel p-6 rounded-2xl bg-white/50 border border-white/60">
                            <h3 className="font-serif font-bold text-slate-800 mb-4 text-lg">Skills & Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills ? user.skills.split(',').map(skill => (
                                    <span key={skill} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:border-amber-300 hover:text-amber-700 transition cursor-default shadow-sm">{skill.trim()}</span>
                                )) : <span className="text-slate-400 text-sm italic">No skills listed yet.</span>}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="font-serif font-bold text-2xl text-slate-800 mb-4">About Me</h3>
                            <div className="p-6 rounded-2xl bg-white/50 border border-white/60 text-slate-600 leading-relaxed">
                                {user.bio ? (
                                    <p>{user.bio}</p>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 italic mb-4">You haven't added a bio yet.</p>
                                        <button className="text-amber-600 font-bold text-sm hover:underline">Add a bio to tell your story</button>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Recent Activity or Stats */}
                         <div>
                            <h3 className="font-serif font-bold text-2xl text-slate-800 mb-4">Impact Overview</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-white border border-slate-100 text-center hover:border-amber-200 hover:shadow-lg transition-all group">
                                    <div className="text-3xl font-serif font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">12</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posts</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-white border border-slate-100 text-center hover:border-amber-200 hover:shadow-lg transition-all group">
                                    <div className="text-3xl font-serif font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">145</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connections</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-white border border-slate-100 text-center hover:border-amber-200 hover:shadow-lg transition-all group">
                                    <div className="text-3xl font-serif font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">4.8</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfilePage;
