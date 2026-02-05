import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, CheckCircle, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock API call simulation
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    if (submitted) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                 <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-100">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Check your inbox</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        If an account exists for <span className="font-bold text-slate-800">{email}</span>, we have sent password reset instructions.
                    </p>
                    <Link 
                        to="/login" 
                        className="inline-flex w-full justify-center items-center py-3.5 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Back to Sign In
                    </Link>
                    <div className="mt-6 text-xs text-slate-400">
                        Didn't receive the email? <button onClick={() => setSubmitted(false)} className="text-amber-600 font-bold hover:underline">Click to retry</button>
                    </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-slate-900/90 z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop" 
                    alt="University Study" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="relative z-20 max-w-md px-12 text-white">
                    <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Secure your<br/>Future.</h2>
                    <p className="text-lg text-slate-200 font-light leading-relaxed">"Education is the passport to the future, for tomorrow belongs to those who prepare for it today."</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full">
                    <div className="mb-10">
                         <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-8 transition">
                            <ArrowLeft size={16} className="mr-1" /> Back to Login
                         </Link>
                        <div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                            <KeyRound size={28} className="text-amber-600" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-slate-800 mb-2">Forgot Password?</h1>
                        <p className="text-slate-500">No worries! Enter your email and we'll send you reset instructions.</p>
                    </div>
                    
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

                        <button 
                            type="submit" 
                            disabled={!email}
                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/30 text-base font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            Reset Password <Send size={18} className="ml-2" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
