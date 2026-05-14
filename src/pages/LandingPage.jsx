import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import {
  GraduationCap, Users, Briefcase, ArrowRight, BookOpen, Star, Sparkles,
  MessageSquare, Calendar, MapPin, Clock, Lock, ThumbsUp, Send,
  TrendingUp, Loader2, Eye, User, Award
} from 'lucide-react';
import PostCard from '../components/explore/PostCard';
import JobCard from '../components/explore/JobCard';
import EventCard from '../components/explore/EventCard';
import MentorCard from '../components/explore/MentorCard';

/* ── Login Prompt Modal ───────────────────────────────────────────────────── */
const LoginOverlay = ({ message, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
      <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
        <Lock size={28} className="text-white" />
      </div>
      <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Sign in Required</h3>
      <p className="text-slate-500 mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all">Sign In</Link>
        <Link to="/register" className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">Register</Link>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Feature Card ─────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div whileHover={{ y: -10 }}
    className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity duration-500`} />
    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3 font-serif">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

/* ── Section Tabs ─────────────────────────────────────────────────────────── */
const tabs = [
  { id: 'feed', label: 'Community Feed', icon: MessageSquare },
  { id: 'jobs', label: 'Job Board', icon: Briefcase },
  { id: 'events', label: 'Campus Events', icon: Calendar },
  { id: 'mentors', label: 'Mentors', icon: Users },
];

/* ── Testimonial Data ─────────────────────────────────────────────────────── */
const testimonials = [
  {
    name: 'Aarav Sharma',
    role: 'Software Engineer at Infosys',
    quote: 'The mentorship I received here directly helped me crack my campus placement interviews. The alumni network is incredibly supportive and always ready to guide juniors!',
    photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=160&h=160&fit=crop&crop=face&auto=format',
  },
  {
    name: 'Priya Verma',
    role: 'Backend Developer at TCS',
    quote: 'I use this platform to connect with talented students from my college. The quality of candidates and the sense of community here is truly unmatched across any other network.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face&auto=format',
  },
  {
    name: 'Rohit Singh',
    role: 'Cloud Engineer at Wipro',
    quote: 'Found my first internship through the exclusive job board on this platform. Campus InfoHub was genuinely my secret weapon throughout my final year of college.',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=face&auto=format',
  },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('feed');
  const [loginPrompt, setLoginPrompt] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      API.get('/public/stats'),
      API.get('/posts/?limit=12'),
      API.get('/jobs/?limit=12'),
      API.get('/public/events?limit=12'),
      API.get('/public/mentors?limit=12'),
    ]).then(([s, p, j, e, m]) => {
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (p.status === 'fulfilled') setPosts(p.value.data);
      if (j.status === 'fulfilled') setJobs(j.value.data);
      if (e.status === 'fulfilled') setEvents(e.value.data);
      if (m.status === 'fulfilled') setMentors(m.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const requireLogin = (msg) => { if (user) return false; setLoginPrompt(msg); return true; };

  /* ── Render Helpers ───────────────────────────────────────────────────── */

  const EmptyState = ({ msg }) => (
    <div className="text-center py-16"><Sparkles size={36} className="mx-auto text-amber-300 mb-3" /><p className="text-slate-400 font-medium">{msg}</p></div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (activeTab) {
              case 'feed': return posts.length ? <div className="grid md:grid-cols-2 gap-6">{posts.map(p=><PostCard key={p.id} post={p} requireLogin={requireLogin} />)}</div> : <EmptyState msg="No posts yet." />;
              case 'jobs': return jobs.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{jobs.map(j=><JobCard key={j.id} job={j} requireLogin={requireLogin} />)}</div> : <EmptyState msg="No jobs right now." />;
              case 'events': return events.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{events.map(e=><EventCard key={e.id} event={e} requireLogin={requireLogin} />)}</div> : <EmptyState msg="No events yet." />;
              case 'mentors': return mentors.length ? <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{mentors.map(m=><MentorCard key={m.id} mentor={m} requireLogin={requireLogin} />)}</div> : <EmptyState msg="Mentors coming soon!" />;
              default: return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background text-text-main transition-colors duration-500">
      {/* ═══ Hero ═══ */}
      <section className="relative pt-20 pb-32 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-200/30 rounded-full blur-[120px] opacity-60 animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[100px] opacity-60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-amber-200 bg-amber-50/50 backdrop-blur-sm text-amber-800 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse" />The Official Community Platform
          </motion.div>
          <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Connect.<br className="md:hidden" /> Learn. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">Achieve Together.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-light">
            Bridge the gap between campus life and career success. Connect with alumni, find mentors, and access exclusive opportunities.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-xl shadow-amber-500/30 transform hover:-translate-y-1 transition-all duration-300">
              Get Started <ArrowRight className="ml-2" size={20} />
            </Link>
            <a href="#explore" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-slate-600 bg-white border border-slate-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 shadow-sm hover:shadow-lg">
              Explore Community
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ Explore Section ═══ */}
      <section id="explore" className="py-20 bg-gradient-to-b from-transparent to-white/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3 block">Live Platform</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Community</span></h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Get a sneak peek into our active network of students, alumni, and exclusive opportunities.</p>
          </div>

          {/* Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { label: 'Members', value: stats.total_members, icon: Users, color: 'from-blue-500 to-blue-600' },
                { label: 'Posts', value: stats.total_posts, icon: MessageSquare, color: 'from-amber-500 to-orange-600' },
                { label: 'Open Jobs', value: stats.total_jobs, icon: Briefcase, color: 'from-emerald-500 to-emerald-600' },
                { label: 'Events', value: stats.total_events, icon: Calendar, color: 'from-violet-500 to-purple-600' },
              ].map(({ label, value, icon: Icon, color }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-full blur-xl -mr-6 -mt-6 transition-opacity`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-serif font-bold text-slate-800">{value.toLocaleString()}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
                    </div>
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}><Icon size={20} /></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-300 hover:text-amber-700'}`}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3 block">Why Join Us?</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Everything you need to grow</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Our platform provides the elite tools and network you need to build your professional legacy from day one.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={Users} title="Alumni Network" description="Search and connect with seniors working in your dream companies. Ask for referrals and guidance." color="from-blue-400 to-blue-600" />
            <FeatureCard icon={Briefcase} title="Exclusive Jobs" description="Access internship and job opportunities posted directly by alumni and partner recruiters." color="from-amber-400 to-orange-600" />
            <FeatureCard icon={GraduationCap} title="Expert Mentorship" description="Book 1:1 sessions with industry experts for career counseling, resume reviews, and mock interviews." color="from-emerald-400 to-emerald-600" />
          </div>
        </div>
      </section>

      {/* ═══ Social Proof / Testimonials ═══ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3 block">Success Stories</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Hear from our Community</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative">
                <div className="absolute top-4 right-6 text-6xl text-amber-100 font-serif">"</div>
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-amber-100 shadow-md"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="h-11 w-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full items-center justify-center text-white font-bold text-sm hidden">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic relative z-10">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #d4af37 0%, transparent 50%), radial-gradient(circle at 80% 20%, #d4af37 0%, transparent 50%)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block text-amber-400 font-bold uppercase tracking-widest text-xs mb-6 border border-amber-400/30 bg-amber-400/10 px-4 py-2 rounded-full">Your Future Starts Here</span>
          <h2 className="text-4xl md:text-6xl font-serif font-extrabold text-white mb-6 leading-tight">Ready to unlock your <span className="text-amber-400">potential?</span></h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">Join thousands of students and alumni who are already building their careers through our community.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-2xl shadow-amber-500/30 transform hover:-translate-y-1 transition-all duration-300">
              Create Free Account <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white border border-white/20 hover:bg-white/10 transition-all duration-300">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center"><GraduationCap size={16} className="text-white" /></div>
                <span className="text-white font-serif font-bold text-lg">Campus <span className="text-amber-400">InfoHub</span></span>
              </div>
              <p className="text-sm leading-relaxed">Connecting students, alumni, and faculty to build careers and communities.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-amber-400 transition">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-amber-400 transition">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-amber-400 transition cursor-default">Alumni Network</span></li>
                <li><span className="hover:text-amber-400 transition cursor-default">Job Board</span></li>
                <li><span className="hover:text-amber-400 transition cursor-default">Mentorship</span></li>
                <li><span className="hover:text-amber-400 transition cursor-default">Campus Events</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-500 cursor-default">{stats?.total_members ? `${stats.total_members.toLocaleString()}+` : '2,500+'} Members</span></li>
                <li><span className="text-slate-500 cursor-default">{stats?.total_posts ? `${stats.total_posts.toLocaleString()}+` : '500+'} Posts</span></li>
                <li><span className="text-slate-500 cursor-default">{stats?.total_mentors ? `${stats.total_mentors.toLocaleString()}+` : '50+'} Mentors</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Campus InfoHub. All rights reserved.</p>
            <p className="text-xs text-slate-600">Built with ❤️ for students and alumni</p>
          </div>
        </div>
      </footer>

      {/* Login Prompt */}
      <AnimatePresence>{loginPrompt && <LoginOverlay message={loginPrompt} onClose={() => setLoginPrompt(null)} />}</AnimatePresence>
    </div>
  );
};

export default LandingPage;