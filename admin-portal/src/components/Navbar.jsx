import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, Users, FileEdit, Database, GraduationCap, ChevronDown, Bell, Table, ClipboardCheck, Layers3, ShieldCheck, FileText } from 'lucide-react';
import { setActiveAdminBatch, useActiveAdminBatch } from '../batch';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(0);
    const [batches, setBatches] = useState([]);
    const activeBatch = useActiveAdminBatch();
    const [activeBatchId, setActiveBatchId] = useState(activeBatch?._id || '');
    const location = useLocation();

    useEffect(() => {
        setActiveBatchId(activeBatch?._id || '');
    }, [activeBatch?._id]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
        const fetchPendingCount = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/admin/notifications`);
                if (!res.ok) return;
                const data = await res.json();
                const pending = Array.isArray(data) ? data.filter(n => n.status === 'pending').length : 0;
                setPendingNotifications(pending);
            } catch (err) {
                // Silent fail to keep navbar responsive even if API is down
            }
        };

        fetchPendingCount();
        const intervalId = setInterval(fetchPendingCount, 10000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
        const fetchBatches = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/batches`);
                if (!res.ok) return;
                const data = await res.json();
                setBatches(Array.isArray(data) ? data : []);
                if (!activeBatchId && Array.isArray(data) && data.length > 0) {
                    setActiveBatchId(data[0]._id);
                    setActiveAdminBatch(data[0]);
                }
            } catch (err) {
                // Keep navbar usable even if the API is temporarily unavailable.
            }
        };

        fetchBatches();
    }, [activeBatchId]);

    const handleBatchChange = (event) => {
        const nextBatchId = event.target.value;
        const nextBatch = batches.find((batch) => batch._id === nextBatchId) || null;
        setActiveBatchId(nextBatchId);
        setActiveAdminBatch(nextBatch);
    };

    const isExamsActive = ['/', '/create', '/create-content'].includes(location.pathname);
    const isManageActive = ['/reports', '/answer-reports', '/attendance', '/notifications'].includes(location.pathname);

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
                                        <span>Exams Manage</span>
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

                        {/* Manage Dropdown */}
                        <div className="relative group">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isManageActive
                                        ? 'bg-navy text-white shadow-lg'
                                        : 'text-white/80 hover:bg-white/15'
                                }`}
                            >
                                <ShieldCheck size={16} />
                                <span>Manage</span>
                                <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                            </button>

                            <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0">
                                <div className="bg-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 overflow-hidden">
                                    <NavLink
                                        to="/reports"
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-lime/20 text-lime'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <Table size={16} />
                                        <span>Reports</span>
                                    </NavLink>

                                    <NavLink
                                        to="/answer-reports"
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-lime/20 text-lime'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <FileText size={16} />
                                        <span>Answer Reports</span>
                                    </NavLink>

                                    <NavLink
                                        to="/attendance"
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-lime/20 text-lime'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <ClipboardCheck size={16} />
                                        <span>Attendance</span>
                                    </NavLink>

                                    <NavLink
                                        to="/notifications"
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-lime/20 text-lime'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <Bell size={16} />
                                        <span>Notification</span>
                                        {pendingNotifications > 0 && (
                                            <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ml-auto">
                                                {pendingNotifications > 99 ? '99+' : pendingNotifications}
                                            </span>
                                        )}
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
                            to="/attendance"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive
                                        ? 'bg-navy text-white shadow-lg'
                                        : 'text-white/80 hover:bg-white/15'
                                }`
                            }
                        >
                            <ClipboardCheck size={16} />
                            <span>Attendance</span>
                        </NavLink>

                        <NavLink
                            to="/batches"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive
                                        ? 'bg-navy text-white shadow-lg'
                                        : 'text-white/80 hover:bg-white/15'
                                }`
                            }
                        >
                            <Layers3 size={16} />
                            <span>Batches</span>
                        </NavLink>

                        {/* Online Students Dropdown */}
                        <div className="relative group">
                            <button 
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    location.pathname === '/active-students' 
                                        ? 'bg-navy text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/15'
                                }`}
                            >
                                <Users size={16} />
                                <span>Online Students</span>
                                <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0">
                                <div className="bg-navy/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 overflow-hidden">
                                    <NavLink 
                                        to="/active-students?view=dashboard" 
                                        className={() => {
                                            const search = new URLSearchParams(location.search);
                                            const isActive = location.pathname === '/active-students' && search.get('view') === 'dashboard';
                                            return `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? 'bg-lime/20 text-lime' 
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`;
                                        }}
                                    >
                                        <LayoutDashboard size={14} />
                                        <span>Dashboard</span>
                                    </NavLink>
                                    
                                    <NavLink 
                                        to="/active-students?view=test" 
                                        className={() => {
                                            const search = new URLSearchParams(location.search);
                                            const isActive = location.pathname === '/active-students' && search.get('view') === 'test';
                                            return `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? 'bg-lime/20 text-lime' 
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`;
                                        }}
                                    >
                                        <Users size={14} />
                                        <span>Test</span>
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: brand */}
                    <div className="flex items-center gap-3">
                        <div className="hidden xl:flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2 border border-white/10">
                            <Layers3 size={16} className="text-white" />
                            <select
                                value={activeBatchId}
                                onChange={handleBatchChange}
                                className="bg-transparent text-white text-sm font-bold outline-none min-w-[180px]"
                            >
                                <option value="" className="text-navy">Select batch</option>
                                {batches.map((batch) => (
                                    <option key={batch._id} value={batch._id} className="text-navy">
                                        {batch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
