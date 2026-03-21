import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, Users } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                        <NavLink 
                            to="/" 
                            end
                            className={({ isActive }) => 
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive 
                                        ? 'bg-navy text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/15'
                                }`
                            }
                        >
                            <LayoutDashboard size={16} />
                            <span>Manage</span>
                        </NavLink>
                        
                        <NavLink 
                            to="/create" 
                            className={({ isActive }) => 
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive 
                                        ? 'bg-navy text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/15'
                                }`
                            }
                        >
                            <CalendarPlus size={16} />
                            <span>Schedule</span>
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
