import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Loader2 } from 'lucide-react';
import API from '../services/api';

const ReportModal = ({ isOpen, onClose, targetId, targetType = 'post', targetUser }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const reasons = [
        "Spam or misleading",
        "Harassment or bullying",
        "Hate speech",
        "Violence or dangerous organizations",
        "Nudity or sexual activity",
        "Intellectual property violation",
        "Something else"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return;
        setSubmitting(true);
        try {
            await API.post('/reports', {
                targetId,
                targetType,
                reportedUser: targetUser,
                reason,
                description
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason('');
                setDescription('');
            }, 2000);
        } catch (err) {
            console.error('Failed to report:', err);
            // In a real app, I'd use toast.error here
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-white/20"
            >
                {success ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-6"
                        >
                            <CheckCircle size={48} />
                        </motion.div>
                        <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">Thank You</h3>
                        <p className="text-slate-500">We've received your report and will review it shortly.</p>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2 flex items-center text-amber-600">
                                    <AlertTriangle className="mr-2" size={24} />
                                    Report Content
                                </h2>
                                <p className="text-slate-500 text-sm">Help us keep the community safe.</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Why are you reporting this?</label>
                                <div className="grid gap-2">
                                    {reasons.map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setReason(r)}
                                            className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                                                reason === r 
                                                ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold shadow-sm' 
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-200'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Details (Optional)</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all h-28 resize-none outline-none"
                                    placeholder="Provide more context for our moderators..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                            
                            <div className="flex space-x-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={!reason || submitting}
                                    className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ReportModal;
