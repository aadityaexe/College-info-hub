import React, { useState } from 'react';
import { Search, Mail, Send, Inbox, ChevronRight, X, Clock, Star } from 'lucide-react';
import ComposeMailModal from '../../components/ComposeMailModal';

const MailPage = () => {
    // Mock Data for now
    const [mails, setMails] = useState([
        { id: 1, sender: 'Admin Office', subject: 'Welcome to the Community', preview: 'We are glad to have you here...', time: '10:30 AM', read: false },
        { id: 2, sender: 'Rahul Verma', subject: 'Notes for DSA', preview: 'Hey, did you get the notes I sent?', time: 'Yesterday', read: true },
        { id: 3, sender: 'Placement Cell', subject: 'New Opportunity at Google', preview: 'Applications are now open for...', time: '2 days ago', read: true },
    ]);

    const [activeTab, setActiveTab] = useState('inbox');
    const [selectedMail, setSelectedMail] = useState(null);
    const [showCompose, setShowCompose] = useState(false);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Internal Mail</h1>
                    <p className="text-slate-500">Secure communications within the campus.</p>
                 </div>
                 <button 
                    onClick={() => setShowCompose(true)}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition flex items-center"
                 >
                     <Send size={18} className="mr-2" />
                     Compose
                 </button>
            </div>

            <div className="flex-1 glass-panel rounded-3xl border border-white/60 shadow-xl shadow-amber-900/5 bg-white/70 overflow-hidden flex">
                
                {/* Sidebar */}
                <div className="w-64 bg-slate-50/50 border-r border-slate-100 p-4 hidden md:flex flex-col">
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all mb-2 ${activeTab === 'inbox' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <Inbox size={20} />
                        <span>Inbox</span>
                        <span className="ml-auto bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded-full">2</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('sent')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all mb-2 ${activeTab === 'sent' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <Send size={20} />
                        <span>Sent</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('starred')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all mb-2 ${activeTab === 'starred' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <Star size={20} />
                        <span>Starred</span>
                    </button>
                </div>

                {/* Mail List */}
                <div className={`${selectedMail ? 'hidden lg:block' : 'block'} w-full lg:w-96 border-r border-slate-100 bg-white/50 overflow-y-auto`}>
                    <div className="p-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Search mail..." 
                                className="w-full bg-slate-100 border-none rounded-xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 outline-none" 
                            />
                        </div>
                    </div>
                    <div>
                        {mails.map(mail => (
                            <div 
                                key={mail.id} 
                                onClick={() => setSelectedMail(mail)}
                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-amber-50/50 transition-colors ${selectedMail?.id === mail.id ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''} ${!mail.read ? 'bg-slate-50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${!mail.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{mail.sender}</h4>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{mail.time}</span>
                                </div>
                                <div className={`text-sm mb-1 ${!mail.read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{mail.subject}</div>
                                <p className="text-xs text-slate-500 truncate">{mail.preview}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mail Content */}
                <div className={`${!selectedMail ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-white overflow-hidden relative`}>
                    {selectedMail ? (
                        <>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                                <div>
                                    <button onClick={() => setSelectedMail(null)} className="lg:hidden mb-2 text-slate-500 flex items-center text-sm font-bold"><ChevronRight className="rotate-180 mr-1" size={16}/> Back</button>
                                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">{selectedMail.subject}</h2>
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-sm">
                                            {selectedMail.sender[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{selectedMail.sender} <span className="text-slate-400 font-normal">&lt;{selectedMail.sender.toLowerCase().replace(' ', '.')}@college.edu&gt;</span></div>
                                            <div className="text-xs text-slate-500">to me</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">{selectedMail.time}</div>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 text-slate-700 leading-relaxed custom-scrollbar">
                                <p>Hi,</p>
                                <p className="mt-4">{selectedMail.preview} This is where the full body of the email would go. It helps us communicate secure and effectively.</p>
                                <p className="mt-4">Regards,<br/>{selectedMail.sender}</p>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                                <button className="border border-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold hover:bg-white hover:border-amber-300 hover:text-amber-700 transition shadow-sm">Reply</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Mail size={48} className="opacity-50" />
                            </div>
                            <p className="font-medium">Select a mail to read</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            <ComposeMailModal isOpen={showCompose} onClose={() => setShowCompose(false)} />
        </div>
    );
};

export default MailPage;
