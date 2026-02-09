import React, { useState, useMemo, useEffect } from 'react';
import API from '../../services/api';
import { 
    Calendar, 
    MapPin, 
    Users, 
    Clock, 
    CheckCircle,
    Star,
    X,
    Search,
    Grid,
    List,
    Filter,
    ArrowRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

const EventsPage = () => {
    const { userRole } = useSelector((state) => state.auth);
    const [filter, setFilter] = useState('upcoming');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleRsvp = async (eventId, status) => {
        try {
            // Optimistic Update
            setEvents(prevEvents => prevEvents.map(event => {
                if (event.id === eventId) {
                    const newStatus = event.userRsvp === status ? null : status;
                    let countChange = 0;
                    if (!event.userRsvp && newStatus) countChange = 1;
                    if (event.userRsvp && !newStatus) countChange = -1;
                    
                    const updatedEvent = { 
                        ...event, 
                        userRsvp: newStatus,
                        attendees: event.attendees + countChange
                    };

                    if (selectedEvent?.id === eventId) {
                        setSelectedEvent(updatedEvent);
                    }
                    return updatedEvent;
                }
                return event;
            }));

            await API.post(`/events/${eventId}/rsvp`, { status });
        } catch (err) {
            console.error("Failed to RSVP", err);
            // Revert changes if needed (omitted for simplicity in mock)
            fetchEvents();
        }
    };

    const isAlumni = userRole === 'alumni';

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Role-based filtering
            if (userRole === 'student' && event.audience === 'Alumni') return false;
            if (userRole === 'alumni' && event.audience === 'Student') return false;

            const matchesFilter = filter === 'all' || 
                                  (filter === 'my events' ? event.userRsvp : true) || 
                                  event.status === filter;
                                  
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  event.type.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch && matchesFilter;
        });
    }, [events, filter, searchQuery, userRole]);

    const getTypeColor = (type) => {
        switch(type) {
            case 'Academic': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Social': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Career': return 'bg-green-100 text-green-700 border-green-200';
            case 'Sports': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-800">
                        {isAlumni ? 'Alumni Events' : 'Campus Events'}
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Discover, connect, and participate in our vibrant community.</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-20">
                {/* Search */}
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search events by name or type..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['upcoming', 'past', 'my events'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
                                filter === f 
                                ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/20' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <span className="capitalize">{f}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid/List */}
            <motion.div 
                layout 
                className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}
            >
                <AnimatePresence>
                    {filteredEvents.map((event) => (
                        viewMode === 'grid' ? (
                            // GRID CARD
                            <motion.div 
                                layout
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedEvent(event)}
                                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 cursor-pointer group flex flex-col h-full"
                            >
                                <div className="h-56 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90" />
                                    <img 
                                        src={`https://source.unsplash.com/random/800x600/?event,${event.type}`} 
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    
                                    <div className="absolute top-4 left-4 z-20 flex flex-col bg-white/95 backdrop-blur-md rounded-2xl text-center px-4 py-2 shadow-lg font-bold border border-white/50">
                                        <span className="text-xs text-amber-600 uppercase tracking-widest">{new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                        <span className="text-2xl text-slate-800 leading-none">{new Date(event.date).getDate()}</span>
                                    </div>

                                    <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getTypeColor(event.type)}`}>
                                        {event.type}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">{event.title}</h3>
                                    
                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <Clock size={16} className="mr-3 text-amber-500" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <MapPin size={16} className="mr-3 text-amber-500" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {['A','B','C'][i]}
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                +{event.attendees}
                                            </div>
                                        </div>
                                        <button className="text-amber-600 font-bold text-sm bg-amber-50 px-4 py-2 rounded-lg group-hover:bg-amber-100 transition-colors">
                                            See Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            // LIST CARD
                            <motion.div 
                                layout
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={() => setSelectedEvent(event)}
                                className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6 group"
                            >
                                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden relative shrink-0">
                                    <img 
                                        src={`https://source.unsplash.com/random/800x600/?event,${event.type}`} 
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </div>
                                
                                <div className="flex-1 min-w-0 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeColor(event.type)}`}>
                                            {event.type}
                                        </span>
                                        <span className="text-slate-400 text-xs font-medium">• {new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-amber-600 transition-colors">{event.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-1 mb-3">{event.description}</p>
                                    <div className="flex items-center justify-center md:justify-start space-x-4 text-xs font-medium text-slate-400">
                                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {event.time}</span>
                                        <span className="flex items-center"><MapPin size={14} className="mr-1" /> {event.location}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 shrink-0">
                                     <button className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all">
                                        <ArrowRight size={20} />
                                     </button>
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header Image */}
                            <div className="h-64 relative shrink-0">
                                <img 
                                    src={`https://source.unsplash.com/random/1200x800/?event,${selectedEvent.type}`} 
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-2 border border-white/30 backdrop-blur-md ${getTypeColor(selectedEvent.type)} bg-opacity-90`}>
                                        {selectedEvent.type}
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold leading-tight mb-2">{selectedEvent.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm font-medium opacity-90">
                                        <span className="flex items-center"><Calendar size={16} className="mr-2" /> {new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                        <span className="flex items-center"><Clock size={16} className="mr-2" /> {selectedEvent.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-2">About Event</h3>
                                            <p className="text-slate-600 leading-relaxed text-sm">{selectedEvent.longDescription || selectedEvent.description}</p>
                                        </div>

                                        {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 mb-3">Speakers & Guests</h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {selectedEvent.speakers.map((speaker, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                                {speaker.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">{speaker}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                            <div className="flex items-start space-x-3 mb-4">
                                                <MapPin className="text-amber-600 mt-1" size={20} />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">Location</p>
                                                    <p className="text-slate-500 text-xs mt-1">{selectedEvent.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Users className="text-amber-600 mt-1" size={20} />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">Attendees</p>
                                                    <p className="text-slate-500 text-xs mt-1">{selectedEvent.attendees} People registered</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RSVP Actions in Modal */}
                                        <div className="space-y-3">
                                            {isAlumni ? (
                                                <button 
                                                    onClick={() => handleRsvp(selectedEvent.id, 'attending')}
                                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                                                        selectedEvent.userRsvp === 'attending'
                                                        ? 'bg-green-600 text-white shadow-green-500/30'
                                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                                                    }`}
                                                >
                                                    <CheckCircle size={20} />
                                                    <span>{selectedEvent.userRsvp === 'attending' ? 'You are Attending' : 'Confirm Attendance'}</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleRsvp(selectedEvent.id, 'going')}
                                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                                                            selectedEvent.userRsvp === 'going'
                                                            ? 'bg-green-600 text-white shadow-green-500/30'
                                                            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30'
                                                        }`}
                                                    >
                                                        <CheckCircle size={20} />
                                                        <span>{selectedEvent.userRsvp === 'going' ? 'Going' : 'Join Event'}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRsvp(selectedEvent.id, 'interested')}
                                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all border-2 ${
                                                            selectedEvent.userRsvp === 'interested'
                                                            ? 'border-amber-500 text-amber-600 bg-amber-50'
                                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <Star size={20} fill={selectedEvent.userRsvp === 'interested' ? "currentColor" : "none"} />
                                                        <span>Interested</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventsPage;
