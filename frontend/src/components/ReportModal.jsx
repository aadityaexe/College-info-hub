import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';
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
            alert('Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                    {success ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-64">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 mb-4">
                                <CheckCircle size={64} />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-slate-800">Rank You</h3>
                            <p className="text-slate-500 mt-2">We have received your report and will review it shortly.</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                    <AlertTriangle className="text-amber-500 mr-2" size={20} />
                                    Report Content
                                </h3>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-4">
                                    Why are you reporting this {targetType}? Your report is anonymous.
                                </p>

                                <div className="space-y-3 mb-4">
                                    {reasons.map((r) => (
                                        <label key={r} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                                            reason === r ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium' : 'border-slate-200 hover:bg-slate-50'
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="reason" 
                                                value={r} 
                                                checked={reason === r}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="mr-3 accent-amber-600"
                                            />
                                            {r}
                                        </label>
                                    ))}
                                </div>

                                <textarea
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                                    rows="3"
                                    placeholder="Optional: Provide more details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button 
                                        onClick={onClose} 
                                        className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={!reason || submitting}
                                        className="px-6 py-2 rounded-lg bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Report'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportModal;
