import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
    Calendar, MapPin, Users, Plus, Search, Trash2, Edit,
    MoreVertical, Filter, X, Save, Clock, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Academic',
        audience: 'All', // New field
        date: '',
        time: '',
        location: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await API.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ 
            title: '', 
            type: 'Academic', 
            audience: 'All',
            date: '', 
            time: '', 
            location: '', 
            description: '', 
            image: '' 
        });
        setIsEditing(false);
        setSelectedEventId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (event) => {
        setFormData({
            title: event.title,
            type: event.type,
            audience: event.audience || 'All',
            date: event.date,
            time: event.time,
            location: event.location,
            description: event.description,
            image: event.image || ''
        });
        setIsEditing(true);
        setSelectedEventId(event.id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await API.put(`/events/${selectedEventId}`, formData);
                setEvents(events.map(ev => ev.id === selectedEventId ? res.data : ev));
            } else {
                const res = await API.post('/events', formData);
                setEvents([res.data, ...events]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            alert(isEditing ? 'Failed to update event' : 'Failed to create event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await API.delete(`/events/${id}`);
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              event.location.toLowerCase().includes(searchTerm.toLowerCase());

        const eventDate = new Date(event.date);
        const today = new Date();
        // Reset time for accurate date comparison
        today.setHours(0,0,0,0);
        
        const isPast = eventDate < today;

        if (activeTab === 'upcoming') return matchesSearch && !isPast;
        if (activeTab === 'past') return matchesSearch && isPast;
        return matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Events Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Create and oversee campus activities</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full sm:w-64 text-sm font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} />
                        <span>Create Event</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit mb-8">
                {['upcoming', 'past'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                            activeTab === tab
                            ? 'bg-amber-100 text-amber-800 shadow-sm'
                            : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-300">
                        <Calendar size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No {activeTab} events found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredEvents.map(event => (
                            <motion.div
                                layout
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 flex flex-col sm:flex-row gap-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>

                                {/* Date Block */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl p-4 w-24 border border-slate-100">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-3xl font-serif font-bold text-slate-800 my-1">{new Date(event.date).getDate()}</span>
                                    <span className="text-xs font-bold text-slate-400">{new Date(event.date).toLocaleString('default', { weekday: 'short' })}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex space-x-2 mb-2">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                    event.type === 'Academic' ? 'bg-blue-50 text-blue-600' :
                                                    event.type === 'Social' ? 'bg-orange-50 text-orange-600' :
                                                    event.type === 'Career' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {event.type}
                                                </span>
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                    event.audience === 'Alumni' ? 'bg-purple-50 text-purple-600' :
                                                    event.audience === 'Student' ? 'bg-indigo-50 text-indigo-600' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {event.audience || 'All'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-slate-800 mb-2 leading-tight">{event.title}</h3>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEditModal(event)}
                                                className="p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-slate-500">
                                            <Clock size={14} className="mr-2 text-slate-400" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <MapPin size={14} className="mr-2 text-slate-400" />
                                            {event.location}
                                        </div>
                                    </div>

                                    <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-50 py-2 px-3 rounded-lg w-fit">
                                        <Users size={14} className="mr-2" />
                                        {event.attendees} Registered
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-serif font-bold text-slate-800">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Title</label>
                                <input
                                    name="title"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                    placeholder="e.g. Annual Tech Symposium"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                                    <select
                                        name="type"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Academic">Academic</option>
                                        <option value="Social">Social</option>
                                        <option value="Career">Career</option>
                                        <option value="Sports">Sports</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Audience</label>
                                    <select
                                        name="audience"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                        value={formData.audience}
                                        onChange={handleInputChange}
                                    >
                                        <option value="All">All Users</option>
                                        <option value="Student">Students Only</option>
                                        <option value="Alumni">Alumni Only</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                                <input
                                    name="location"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                    placeholder="e.g. Auditorium A"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="3"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition resize-none"
                                    placeholder="Event details..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Image URL (Optional)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        name="image"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                                        placeholder="https://"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-black transition shadow-lg shadow-slate-900/20 flex items-center"
                                >
                                    <Save size={18} className="mr-2" />
                                    {isEditing ? 'Update Event' : 'Save Event'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
