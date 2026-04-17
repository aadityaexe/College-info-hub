import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';

// ─── Password Strength Helper ─────────────────────────────────────────────────
const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        { score: 0, label: '', color: '' },
        { score: 1, label: 'Weak', color: 'bg-red-400' },
        { score: 2, label: 'Fair', color: 'bg-amber-400' },
        { score: 3, label: 'Good', color: 'bg-blue-400' },
        { score: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    return levels[score];
};

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        reg_no: '',
        course: 'B.Tech',
        batch: '2022-2026',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [clientError, setClientError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const courses = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'BBA', 'PhD'];
    const batches = [
        '2021-2025', '2022-2026', '2023-2027', '2024-2028',
        '2015-2019', '2016-2020', '2017-2021', '2018-2022', '2019-2023', '2020-2024',
    ];

    const passwordStrength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setClientError('');
    };

    const validate = () => {
        if (!formData.name.trim()) return 'Full name is required.';
        if (!formData.email.includes('@')) return 'Please enter a valid email address.';
        if (formData.password.length < 6) return 'Password must be at least 6 characters.';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setClientError(validationError);
            return;
        }
        const { confirmPassword, ...payload } = formData;
        dispatch(registerUser(payload)).then((result) => {
            if (!result.error) {
                setSubmitted(true);
            }
        });
    };

    // ── Success Screen ─────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-100">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">You're on the list!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Your account has been created and is currently{' '}
                        <span className="font-bold text-amber-600">pending approval</span>.
                        You will be notified once an administrator verifies your details.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex w-full justify-center items-center py-3.5 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg"
                    >
                        Return to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const displayError = clientError || error;

    return (
        <div className="min-h-[calc(100vh-80px)] flex">
            {/* Left Side — Image */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 to-slate-900/90 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                    alt="University Library"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="relative z-20 max-w-md px-12 text-white text-right">
                    <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">Join the<br />Network.</h2>
                    <p className="text-lg text-slate-200 font-light leading-relaxed">
                        Create your profile to start connecting with mentors, peers, and opportunities that align with your ambitions.
                    </p>
                </div>
            </div>

            {/* Right Side — Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:p-12 bg-white overflow-y-auto">
                <div className="max-w-xl w-full">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-slate-800">Create Account</h2>
                            <p className="text-slate-500 text-sm">Join the ecosystem today</p>
                        </div>
                    </div>

                    {displayError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">I am a:</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['student', 'alumni'].map((r) => (
                                    <label
                                        key={r}
                                        className={`cursor-pointer border rounded-xl p-4 flex items-center justify-center transition-all ${
                                            formData.role === r
                                                ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500'
                                                : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={r}
                                            checked={formData.role === r}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <span className="font-bold capitalize">{r}</span>
                                    </label>
                                ))}
                            </div>
                            {formData.role === 'alumni' && (
                                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    Alumni accounts require admin verification before getting full access.
                                </p>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 outline-none transition-all font-medium text-slate-800"
                                    placeholder="John Doe"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Registration No.</label>
                                <input
                                    type="text"
                                    name="reg_no"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 outline-none transition-all font-medium text-slate-800"
                                    placeholder="e.g. 2022BTCSE001"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 outline-none transition-all font-medium text-slate-800"
                                placeholder="john@example.com"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Course</label>
                                <div className="relative">
                                    <select
                                        name="course"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 outline-none transition-all font-medium text-slate-800 appearance-none"
                                        onChange={handleChange}
                                        value={formData.course}
                                    >
                                        {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ArrowRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Batch / Session</label>
                                <div className="relative">
                                    <select
                                        name="batch"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 outline-none transition-all font-medium text-slate-800 appearance-none"
                                        onChange={handleChange}
                                        value={formData.batch}
                                    >
                                        {batches.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <ArrowRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 p-3 pr-12 outline-none transition-all font-medium text-slate-800"
                                    placeholder="Min. 6 characters"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all ${
                                                    i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Strength: <span className="font-semibold">{passwordStrength.label || 'Too Short'}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    required
                                    className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white shadow-sm focus:ring-2 p-3 pr-12 outline-none transition-all font-medium text-slate-800 ${
                                        formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                                            : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
                                    }`}
                                    placeholder="Repeat your password"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                id="register-submit-btn"
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-amber-500/30 text-base font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit for Admin Approval'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-amber-600 font-bold hover:text-amber-700 hover:underline">
                            Sign In here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
