import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Save, 
    Globe, 
    Shield, 
    Bell, 
    Palette, 
    Mail, 
    Smartphone,
    Database,
    AlertTriangle
} from 'lucide-react';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    // Mock Settings State
    const [settings, setSettings] = useState({
        siteName: 'College Community Hub',
        supportEmail: 'support@collegehub.com',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        pushNotifications: false,
        theme: 'light',
        primaryColor: 'amber'
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // In a real app, you'd show a toast here
            alert('Settings saved successfully!');
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Site Name</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">The name displayed in the browser tab and navigation.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="email" 
                                        name="supportEmail"
                                        value={settings.supportEmail}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Contact address for user support inquiries.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start space-x-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-red-500">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-red-800">Maintenance Mode</h4>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.maintenanceMode}
                                            onChange={() => handleToggle('maintenanceMode')}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                    </label>
                                </div>
                                <p className="text-sm text-red-600/80">Disable access to the site for all users except admins. Use with caution.</p>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start space-x-4">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                                <Shield size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">User Registration</h4>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.allowRegistration}
                                            onChange={() => handleToggle('allowRegistration')}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>
                                <p className="text-sm text-slate-500">Allow new users to sign up. If disabled, only admins can create accounts.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4">
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center space-x-3">
                                    <Mail className="text-slate-400" size={20} />
                                    <div>
                                        <h4 className="font-bold text-slate-700">Email Notifications</h4>
                                        <p className="text-xs text-slate-400 font-medium">Receive system alerts via email</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.emailNotifications}
                                        onChange={() => handleToggle('emailNotifications')}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Smartphone className="text-slate-400" size={20} />
                                    <div>
                                        <h4 className="font-bold text-slate-700">Push Notifications</h4>
                                        <p className="text-xs text-slate-400 font-medium">Receive mobile push alerts</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.pushNotifications}
                                        onChange={() => handleToggle('pushNotifications')}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="space-y-6">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['light', 'dark', 'system'].map((theme) => (
                                <button 
                                    key={theme}
                                    onClick={() => setSettings(prev => ({ ...prev, theme }))}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                                        settings.theme === theme 
                                        ? 'border-amber-500 bg-amber-50 text-amber-800' 
                                        : 'border-slate-200 hover:border-slate-300 text-slate-500'
                                    }`}
                                >
                                    <span className="capitalize font-bold">{theme}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage system configurations and preferences</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Save size={18} />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm transition-all whitespace-nowrap relative ${
                                    isActive ? 'text-amber-600 bg-amber-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeSettingTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="p-8 min-h-[400px]">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </div>
            
             
        </div>
    );
};

export default AdminSettings;
