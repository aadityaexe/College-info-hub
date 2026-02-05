import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Briefcase, ArrowRight, ShieldCheck, BookOpen, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-500`}></div>
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3 font-serif relative z-10">{title}</h3>
        <p className="text-slate-500 leading-relaxed relative z-10">{description}</p>
    </motion.div>
);

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-40 md:py-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full -z-10">
                     <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-200/30 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
                     <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[100px] opacity-60"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-2 rounded-full border border-amber-200 bg-amber-50/50 backdrop-blur-sm text-amber-800 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                        The Official Community Platform
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]"
                    >
                        Connect.<br className="md:hidden" /> Learn. <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">Achieve Together.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-light"
                    >
                        Bridge the gap between campus life and career success. Connect with alumni, find mentors, and access exclusive opportunities.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center gap-5"
                    >
                        <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-xl shadow-amber-500/30 transform hover:-translate-y-1 transition-all duration-300">
                            Get Started
                            <ArrowRight className="ml-2" size={20} />
                        </Link>
                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-slate-600 bg-white border border-slate-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 shadow-sm hover:shadow-lg">
                            Sign In
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-200/60 pt-12"
                    >
                         {[
                             { num: "2,500+", label: "Commmunity Members" },
                             { num: "500+", label: "Success Stories" },
                             { num: "150+", label: "Partner Companies" },
                             { num: "50+", label: "Expert Mentors" }
                         ].map((stat, i) => (
                             <div key={i}>
                                 <p className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-1">{stat.num}</p>
                                 <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{stat.label}</p>
                             </div>
                         ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                     <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl opacity-50"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3 block">Why Join Us?</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Everything you need to grow</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Our platform provides the elite tools and network you need to build your professional legacy from day one.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Users} 
                            title="Alumni Network" 
                            description="Search and connect with seniors working in your dream companies. Ask for referrals and guidance."
                            color="from-blue-400 to-blue-600"
                        />
                        <FeatureCard 
                            icon={Briefcase} 
                            title="Exclusive Jobs" 
                            description="Access internship and job opportunities posted directly by alumni and partner recruiters."
                            color="from-amber-400 to-orange-600"
                        />
                        <FeatureCard 
                            icon={GraduationCap} 
                            title="Expert Mentorship" 
                            description="Book 1:1 sessions with industry experts for career counseling, resume reviews, and mock interviews."
                            color="from-emerald-400 to-emerald-600"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
