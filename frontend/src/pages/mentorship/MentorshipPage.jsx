import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, fetchMentors, requestMentorship, fetchIncomingRequests, updateRequestStatus } from '../../features/mentorship/mentorshipSlice';
import { Loader2, User, Award, Send, CheckCircle, Clock, XCircle } from 'lucide-react';

const MentorshipPage = () => {
  const dispatch = useDispatch();
  const { requests, incomingRequests, mentors, loading } = useSelector((state) => state.mentorship);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchMentors());
    dispatch(fetchIncomingRequests()); // Always fetch for demo purposes
  }, [dispatch]);

  const handleStatusUpdate = (id, status) => {
      dispatch(updateRequestStatus({ id, status }));
  };

  const openRequestModal = (mentor) => {
      setSelectedMentor(mentor);
      setSelectedSlot(null);
      setIsModalOpen(true);
  };

  const handleRequest = (e) => {
    e.preventDefault();
    if(selectedMentor && selectedSlot) {
        dispatch(requestMentorship({ 
            mentor_id: selectedMentor.id, 
            mentor_name: selectedMentor.name,
            message,
            slot: selectedSlot
        }));
        setIsModalOpen(false);
        setMessage('');
        setSelectedSlot(null);
        setSelectedMentor(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6 tracking-tight">Mentorship Program</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed font-light">Connect with experienced Alumni and Faculty to guide your career path and unlock your potential.</p>
      </div>

      {/* Incoming Requests (For Alumni/Faculty) */}
      {(user?.role === 'alumni' || user?.role === 'faculty') && incomingRequests && incomingRequests.length > 0 && (
          <div className="mb-20">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-8 border-b border-slate-200 pb-4 inline-block pr-12">Incoming Requests</h2>
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-xl shadow-slate-900/5 bg-white/70">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/80 backdrop-blur-sm">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white/60">
                            {incomingRequests.filter(req => req.status === 'Pending').length === 0 && (
                                <tr><td colSpan="4" className="p-10 text-center text-slate-400 italic">No pending requests at the moment.</td></tr>
                            )}
                            {incomingRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-amber-50/50 transition duration-200">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm mr-4 shadow-sm">
                                                 {req.student_name ? req.student_name.charAt(0) : 'S'}
                                            </div>
                                            <div className="text-base font-bold text-slate-800">{req.student_name || 'Student Name'}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm text-slate-600 max-w-xs truncate font-medium" title={req.message}>{req.message}</div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full items-center border
                                            ${req.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                              req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                                              'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        {req.status === 'Pending' ? (
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => handleStatusUpdate(req.id, 'Accepted')} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-2.5 rounded-xl transition" title="Accept">
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button onClick={() => handleStatusUpdate(req.id, 'Rejected')} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition" title="Reject">
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
      )}

      {/* Mentors Directory - Visible to All */}
      <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-slate-800 mb-8 border-b border-slate-200 pb-4 inline-block pr-12">Available Mentors</h2>
          <div className="grid gap-8 md:grid-cols-3">
              {mentors.map(mentor => (
                  <div key={mentor.id} className="glass-panel rounded-2xl p-8 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1 transition-all duration-300 border border-white/60 bg-white/70 flex flex-col items-center text-center group">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-white flex items-center justify-center font-serif font-bold text-3xl text-slate-700 shadow-xl border-4 border-white mb-6 group-hover:scale-110 transition-transform duration-300">
                          {mentor.name.charAt(0)}
                      </div>
                      
                      <h3 className="font-serif font-bold text-2xl text-slate-800 mb-1">{mentor.name}</h3>
                      <p className="text-amber-600 font-bold text-sm tracking-wide uppercase mb-6">{mentor.role}</p>

                      <div className="mb-8">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                              <Award size={14} className="mr-2 text-amber-500" />
                              {mentor.expertise}
                          </span>
                      </div>
                      
                      <div className="w-full mt-auto">
                          <Link to={`/${user?.role || 'student'}/mentorship/mentors/${mentor.id}`} className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all text-center">
                              View Profile
                          </Link>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* My Requests (Students Only) */}
      {user?.role === 'student' && (
      <div>
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-8 border-b border-slate-200 pb-4 inline-block pr-12">Your Requests</h2>
        {loading && requests.length === 0 ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-lg bg-white/70">
              {requests.length === 0 ? (
                  <div className="p-16 text-center">
                       <div className="text-slate-300 mb-4"><Send size={48} className="mx-auto"/></div>
                       <p className="text-slate-500 font-medium text-lg">You haven't sent any requests yet.</p>
                       <p className="text-slate-400">Start connecting with mentors above!</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-black/10">
                          <thead className="bg-black/5">
                              <tr>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mentor</th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Topic</th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-black/10">
                              {requests.map((req) => (
                                  <tr key={req.id} className="hover:bg-black/5 transition">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm font-bold text-gray-800">{req.mentor_name || `ID: ${req.mentor_id}`}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm text-gray-600">{req.topic || 'General Guidance'}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm text-gray-500">{new Date(req.requested_date).toLocaleDateString()}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          {req.status === 'Accepted' ? (
                                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/10 text-green-600 border border-green-500/20 items-center">
                                                  <CheckCircle size={12} className="mr-1" /> Accepted
                                              </span>
                                          ) : (
                                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 items-center">
                                                  <Clock size={12} className="mr-1" /> Pending
                                              </span>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
        )}
      </div>
      )}

      {/* Request Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-panel rounded-3xl w-full max-w-lg p-8 transform transition-all border border-white/60 shadow-2xl bg-white/95 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"></div>

                  <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-2 hover:bg-slate-100 rounded-full">
                      <Send size={20} className="transform rotate-180"/> 
                  </button>
                  
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">Request Mentorship</h3>
                  <p className="text-sm text-slate-500 mb-8 font-medium">Sending request to <span className="font-bold text-amber-600 text-lg ml-1">{selectedMentor?.name}</span></p>
                  
                  <form onSubmit={handleRequest}>
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select a Time Slot</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {selectedMentor?.availableSlots?.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                                        selectedSlot === slot 
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-md transform scale-105' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>

                        <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none placeholder-slate-400 outline-none transition-all custom-scrollbar font-medium"
                            rows="4"
                            placeholder="Introduce yourself and explain why you're seeking mentorship with this specific mentor..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                          <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={!selectedSlot || !message.trim()}
                            className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <span>Send Request</span>
                              <Send size={16} className="ml-2" />
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default MentorshipPage;
