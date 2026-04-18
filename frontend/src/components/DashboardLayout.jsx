import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Briefcase, 
  Users, 
  LayoutDashboard, 
  FileText, 
  Settings 
} from 'lucide-react';


const SidebarItem = ({ to, icon: Icon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30' 
                : 'text-gray-500 hover:bg-white hover:text-primary-600 hover:shadow-md'
            }`}
        >
            <Icon size={20} className={isActive ? 'text-white' : ''} />
            <span>{label}</span>
        </Link>
    );
};

const DashboardLayout = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (!user) {
        // Fallback if protected route fails (should verify in App.jsx)
        return null; 
    }

    // Define Menus based on Role
    const studentMenu = [
        { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/feed', icon: Home, label: 'Community Feed' },
        { to: '/jobs', icon: Briefcase, label: 'Find Jobs' },
        { to: '/mentorship', icon: Users, label: 'Mentorship' },
        { to: '/profile', icon: Settings, label: 'My Profile' }, // Using Settings icon for profile in sidebar
    ];

    const alumniMenu = [
        { to: '/alumni/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/feed', icon: Home, label: 'Community Feed' },
        { to: '/jobs', icon: Briefcase, label: 'Jobs & Internships' }, // Can post jobs from here
        { to: '/mentorship', icon: Users, label: 'Mentorship Requests' },
        { to: '/profile', icon: Settings, label: 'My Profile' },
    ];

    // Default to student if role is missing or unknown for now
    const menuItems = user.role === 'alumni' || user.role === 'faculty' ? alumniMenu : studentMenu;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-gray-50/80 backdrop-blur-xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out p-6 flex flex-col ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="flex items-center space-x-3 mb-10 px-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                         <span className="text-white font-serif font-bold text-xl">C</span>
                    </div>
                    <span className="text-xl font-serif font-bold text-gray-800 tracking-tight">CollegeHub</span>
                </div>

                <div className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <SidebarItem key={item.to} {...item} onClick={() => setIsSidebarOpen(false)} />
                    ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                    
                    <div className="mt-6 flex items-center space-x-3 px-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Top Mobile Bar */}
                <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30">
                     <span className="font-serif font-bold text-gray-800">CollegeHub</span>
                     <button onClick={() => setIsSidebarOpen(true)}>
                         <Menu size={24} className="text-gray-600" />
                     </button>
                </div>

                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
