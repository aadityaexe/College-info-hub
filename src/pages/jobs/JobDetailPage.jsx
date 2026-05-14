import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Loader2, ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, ExternalLink, Building, CheckCircle } from 'lucide-react';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await API.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        setError('Job not found or deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;
  if (error) return <div className="text-center p-10 text-red-500 font-bold">{error} <button onClick={() => navigate(-1)} className="ml-2 underline">Go Back</button></div>;
  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-slate-800 transition mb-6 font-medium"
        >
            <ArrowLeft size={18} className="mr-1" /> Back to Jobs
        </button>

        <div className="glass-panel rounded-3xl p-8 md:p-10 border border-white/60 shadow-2xl shadow-amber-900/10 bg-white relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-slate-100 pb-8">
                <div className={`h-24 w-24 rounded-2xl ${job.logo_color || 'bg-slate-800'} flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0`}>
                    {job.company.charAt(0)}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-600">
                        <span className="flex items-center font-bold text-lg"><Building size={18} className="mr-1.5 text-amber-600"/> {job.company}</span>
                        <span className="flex items-center text-sm bg-slate-50 px-3 py-1 rounded-full"><MapPin size={14} className="mr-1.5"/> {job.location}</span>
                        <span className="flex items-center text-sm bg-slate-50 px-3 py-1 rounded-full"><Briefcase size={14} className="mr-1.5"/> {job.type}</span>
                    </div>
                </div>
                <div className="md:text-right flex flex-col items-start md:items-end justify-center">
                     <p className="text-2xl font-bold text-slate-800 flex items-center mb-1"><DollarSign size={20} className="text-green-600 mr-1"/> {job.salary}</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Salary</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 font-serif">About the Role</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                    </section>

                    <section>
                         <h3 className="text-lg font-bold text-slate-800 mb-3 font-serif">Key Requirements</h3>
                         <div className="flex flex-wrap gap-2">
                            {job.requirements?.map((req, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-sm font-bold border border-amber-100">{req}</span>
                            ))}
                         </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Job Details</h3>
                        <div className="space-y-3 text-sm text-slate-600">
                             <div className="flex justify-between">
                                 <span>Posted On</span>
                                 <span className="font-bold">{new Date(job.posted_date).toLocaleDateString()}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Expiration</span>
                                 <span className="font-bold">Rolling Basis</span>
                             </div>
                        </div>
                    </div>

                    <a 
                        href={job.apply_link || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-1 block text-center"
                    >
                        Apply Now <ExternalLink size={20} className="ml-2" />
                    </a>
                    
                    <p className="text-xs text-center text-slate-400 px-4">
                        You will be redirected to the company's official career page to complete your application.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default JobDetailPage;
