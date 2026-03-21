import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, LogOut, Edit3, Save, X, Mail, Info, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Load user from storage
    const initialUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const [userData, setUserData] = useState({
        name: initialUser.name || 'Anonymous User',
        email: initialUser.email || 'guest@zest.com',
        role: initialUser.role || 'Student',
        profilePic: initialUser.profilePic || null
    });

    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState({ ...userData });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/auth');
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setTempData({ ...userData });
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        setTempData({ ...tempData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedUser = { ...userData, ...tempData };
        setUserData(updatedUser);
        
        // Update storage
        const storageType = localStorage.getItem('user') ? localStorage : sessionStorage;
        storageType.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col overflow-x-hidden">
            {/* Navigation (Standardized) */}
            <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${isScrolled
                ? 'bg-[#92c211] md:bg-[#92c211]/60 py-1'
                : 'bg-[#92c211] md:bg-[#92c211]/90 py-0'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link to="/home" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                                <ArrowLeft size={20} />
                            </Link>
                            <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
                            <span className="text-white font-bold text-xl tracking-tight">Zest</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-8 mr-4">
                                <Link to="/profile" className="text-white nav-hover-underline underline-offset-8 decoration-2 px-1 py-2 text-lg tracking-tight transition-all">Profile</Link>
                                <Link to="/analytics" className="text-white nav-hover-draw px-1 py-2 text-lg tracking-tight transition-all">Analytics</Link>
                            </div>
                            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-bold">
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white">
                                <div className="w-6 h-5 flex flex-col justify-between">
                                    <span className={`h-1 w-full bg-white rounded-full transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                    <span className={`h-1 w-full bg-white rounded-full transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`h-1 w-full bg-white rounded-full transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`md:hidden bg-lime transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 border-b border-white/20' : 'max-h-0'}`}>
                    <div className="px-4 py-6 space-y-4">
                        <Link to="/profile" className="block text-white font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                        <Link to="/analytics" className="block text-white font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>Analytics</Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-white font-bold text-lg pt-4 border-t border-white/20 w-full">
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Profile Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-navy/5 p-8 md:p-12 mb-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-lime/20 to-lime/10"></div>
                        
                        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 mt-4">
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 border-4 border-white shadow-xl overflow-hidden">
                                    {userData.profilePic ? (
                                        <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} />
                                    )}
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 bg-navy text-white rounded-2xl shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                                    <Camera size={20} />
                                </button>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                                    <h1 className="text-4xl font-extrabold text-navy tracking-tight">{userData.name}</h1>
                                    <span className="inline-block px-4 py-1 bg-lime/10 text-navy text-xs font-black uppercase tracking-widest rounded-full">{userData.role}</span>
                                </div>
                                <p className="text-slate-500 font-medium text-lg leading-relaxed flex items-center justify-center md:justify-start gap-2">
                                    <Mail size={18} className="text-lime" /> {userData.email}
                                </p>
                            </div>

                            <button 
                                onClick={handleEditToggle}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                                    isEditing ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-navy text-white shadow-lg shadow-navy/20 hover:scale-105'
                                }`}
                            >
                                {isEditing ? <><X size={18}/> Cancel</> : <><Edit3 size={18}/> Edit Profile</>}
                            </button>
                        </div>
                    </motion.div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Status/Banner side */}
                        <div className="md:col-span-1 space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-navy text-white p-8 rounded-[2rem] shadow-xl shadow-navy/20"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <Info size={24} className="text-lime" />
                                    <h3 className="text-xl font-bold">Zest Member</h3>
                                </div>
                                <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                                    Joined the platform to master Data Structures & Algorithms. All rights reserved.
                                </p>
                                <div className="flex items-center gap-3 text-lime font-black text-sm uppercase tracking-widest">
                                    <span>Verfied</span>
                                    <div className="w-2 h-2 rounded-full bg-lime animate-pulse"></div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm"
                            >
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Security Notice</h3>
                                <div className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    For security reasons, your <span className="text-navy font-bold">Email ID</span> and <span className="text-navy font-bold">Password</span> can only be updated via the support portal.
                                </div>
                            </motion.div>
                        </div>

                        {/* Editable Form Side */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-navy/5 p-8 md:p-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-navy flex items-center gap-3">
                                    {isEditing ? 'Update your details' : 'Personal Information'}
                                </h2>
                                {isEditing && (
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-3 bg-lime text-navy font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-lime/20 hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin"></div> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                )}
                            </div>

                            <form className="space-y-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={isEditing ? tempData.name : userData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all font-bold disabled:text-slate-500 disabled:bg-slate-50/50"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                {/* Email Input (READ ONLY) */}
                                <div className="space-y-2">
                                    <div className="flex justify-between px-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email ID</label>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter italic">🔒 Read Only</span>
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input 
                                            type="email" 
                                            value={userData.email}
                                            disabled
                                            className="w-full pl-12 pr-4 py-4 bg-slate-100/30 border border-slate-100 text-slate-400 rounded-2xl outline-none transition-all font-medium cursor-not-allowed opacity-60"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Password Field (READ ONLY Placeholder) */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between px-1">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter italic">🔒 Read Only</span>
                                        </div>
                                        <div className="relative">
                                            <LogOut className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-50" size={18} />
                                            <input 
                                                type="password" 
                                                value="••••••••••••"
                                                disabled
                                                className="w-full pl-12 pr-4 py-4 bg-slate-100/30 border border-slate-100 text-slate-400 rounded-2xl outline-none transition-all font-medium cursor-not-allowed opacity-60"
                                            />
                                        </div>
                                    </div>
                                </div>


                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>

            <footer className="py-12 bg-navy text-white text-center px-4 mt-auto">
                <p className="font-medium leading-relaxed opacity-80">
                    <span className="block md:inline">&copy; {new Date().getFullYear()} <span className="font-bold text-white">Shreyansh Srivastava</span></span>
                    <span className="hidden md:inline"> . </span>
                    <span className="block md:inline uppercase tracking-wider text-[10px] md:text-sm md:normal-case font-bold md:font-medium">For Algorithmist DSA Classes</span>
                </p>
            </footer>
        </div>
    );
};

export default Profile;
