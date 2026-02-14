import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchProfile } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogIn, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
        dispatch(fetchProfile()).then((action) => {
             const userRole = action.payload?.role?.toLowerCase();
             if (userRole === 'admin') navigate('/admin');
             else if (userRole === 'alumni' || userRole === 'faculty') navigate('/alumni/dashboard');
             else navigate('/student/dashboard'); // Default
        });
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      {/* Left Side - Brand Image (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-slate-900/90 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
            alt="University Campus" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-20 max-w-lg px-12 text-white">
              <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Welcome to your community.</h2>
              <p className="text-lg text-slate-200 font-light leading-relaxed">Connect with peers, find mentors, and unlock your career potential. Your journey starts here.</p>
          </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
            <div className="mb-10">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
                    <LogIn size={28} className="text-white" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-slate-800 mb-2">Welcome Back</h1>
                <p className="text-slate-500">Sign in to access your dashboard</p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-8 text-xs text-amber-900 space-y-2">
                <p className="font-bold uppercase tracking-wider text-amber-600 mb-1">Demo Credentials</p>
                <div className="space-y-1 font-mono text-slate-600">
                    <p><span className="font-bold text-slate-800">Student:</span> student1@test.com / password</p>
                    <p><span className="font-bold text-slate-800">Alumni:</span> alumni1@test.com / password</p>
                    <p><span className="font-bold text-slate-800">Admin:</span> admin@collegehub.com / admin123</p>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input 
                type="email" 
                required 
                className="w-full rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3.5 transition-all outline-none font-medium text-slate-800 placeholder-slate-400" 
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Password</label>
                    <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 font-bold hover:underline">Forgot?</Link>
                </div>
                <input 
                type="password" 
                required 
                className="w-full rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3.5 transition-all outline-none font-medium text-slate-800 placeholder-dots" 
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/30 text-base font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Sign In <ArrowRight size={18} className="ml-2" /></>}
            </button>
            </form>
            <div className="mt-8 text-center text-sm text-slate-500">
                Don't have an account? <Link to="/register" className="text-amber-600 font-bold hover:text-amber-700 hover:underline">Create Account</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
