import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComposeMailModal = ({ isOpen, onClose, recipientName = '' }) => {
    const [recipient, setRecipient] = useState(recipientName);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                ></motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-serif font-bold text-slate-800 text-lg">New Message</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <input 
                                type="text" 
                                placeholder="To: (Name or Reg No)" 
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="w-full border-b border-slate-200 py-2 focus:border-amber-500 outline-none font-medium placeholder-slate-400 bg-transparent transition-colors" 
                            />
                        </div>
                        <div>
                            <input type="text" placeholder="Subject" className="w-full border-b border-slate-200 py-2 focus:border-amber-500 outline-none font-bold placeholder-slate-400 bg-transparent transition-colors" />
                        </div>
                        <div>
                            <textarea rows="8" placeholder="Write your message here..." className="w-full py-2 outline-none resize-none placeholder-slate-400 text-slate-600 bg-transparent"></textarea>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
                         <button onClick={onClose} className="bg-amber-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition flex items-center transform hover:-translate-y-0.5">
                             <Send size={18} className="mr-2"/> Send Message
                         </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ComposeMailModal;
