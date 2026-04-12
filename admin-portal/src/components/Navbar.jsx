import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, Users, FileEdit, Database, GraduationCap, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isExamsActive = ['/', '/create', '/create-content'].includes(location.pathname);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${
            isScrolled 
                ? 'bg-lime/60 py-1' 
                : 'bg-lime/90 py-0'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: nav links */}
                    <div className="flex items-center gap-1">
                        {/* Exams Dropdown */}
                        <div className="relative group">
                            <button 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isExamsActive 
                                        ? 'bg-navy text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/15'
                                }`}
                            >
                                <GraduationCap size={16} />
                                <span>Exams</span>
                                <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0">
                                <div className="bg-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 overflow-hidden">
                                    <NavLink 
                                        to="/" 
                                        end
                                        className={({ isActive }) => 
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? 'bg-lime/20 text-lime' 
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <LayoutDashboard size={16} />
                                        <span>Manage</span>
                                    </NavLink>
                                    
                                    <NavLink 
                                        to="/create" 
                                        className={({ isActive }) => 
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? 'bg-lime/20 text-lime' 
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <CalendarPlus size={16} />
                                        <span>Schedule</span>
                                    </NavLink>

                                    <NavLink 
                                        to="/create-content" 
                                        className={({ isActive }) => 
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? 'bg-lime/20 text-lime' 
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <FileEdit size={16} />
                                        <span>Build Content</span>
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                        
                        <NavLink 
                            to="/storage" 
                            className={({ isActive }) => 
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive 
                                        ? 'bg-navy text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/15'
                                }`
                            }
                        >
                            <Database size={16} />
                            <span>Storage</span>
                        </NavLink>

                        <NavLink 
                            to="/active-students" 
                            className={({ isActive }) => 
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive 
                                        ? 'bg-navy text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/15'
                                }`
                            }
                        >
                            <Users size={16} />
                            <span>Active Students</span>
                        </NavLink>
                    </div>

                    {/* Right: brand */}
                    <div className="flex items-center gap-3">
                        <img 
                            src="/logo.png" 
                            alt="Zest Logo" 
                            className="w-8 h-8 object-contain" 
                            onError={(e) => e.target.style.display = 'none'} 
                        />
                        <span className="text-white font-bold text-xl tracking-tight">Zest</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
