import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CalendarPlus, Users, FileEdit, Database, GraduationCap, ChevronDown, Bell, Table, ClipboardCheck, Layers3, ShieldCheck, FileText } from 'lucide-react';
import { setActiveAdminBatch, useActiveAdminBatch } from '../batch';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(0);
    const [batches, setBatches] = useState([]);
    const [isBatchMenuOpen, setIsBatchMenuOpen] = useState(false);
    const activeBatch = useActiveAdminBatch();
    const [activeBatchId, setActiveBatchId] = useState(activeBatch?._id || '');
    const location = useLocation();
    const batchMenuRef = useRef(null);

    useEffect(() => {
        setActiveBatchId(activeBatch?._id || '');
    }, [activeBatch?._id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (batchMenuRef.current && !batchMenuRef.current.contains(event.target)) {
                setIsBatchMenuOpen(false);
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setIsBatchMenuOpen(false);
    };

    const handleBatchSelect = (batch) => {
        setActiveBatchId(batch._id);
        setActiveAdminBatch(batch);
        setIsBatchMenuOpen(false);
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
                        <div ref={batchMenuRef} className="hidden xl:block relative">
                            <button
                                type="button"
                                onClick={() => setIsBatchMenuOpen((prev) => !prev)}
                                className={`group flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 ${
                                    isBatchMenuOpen
                                        ? 'bg-white/20 border-white/30 shadow-white/10'
                                        : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20'
                                }`}
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                                    <Layers3 size={16} />
                                </div>
                                <div className="text-left leading-tight">
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">Batch</p>
                                    <p className="max-w-[180px] truncate text-sm font-bold text-white">
                                        {activeBatch?.name || 'Select batch'}
                                    </p>
                                </div>
                                <ChevronDown size={16} className={`text-white/70 transition-transform duration-300 ${isBatchMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isBatchMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-[1.5rem] border border-white/10 bg-navy/95 p-2 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-2xl"
                                    >
                                        <div className="mb-2 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Active Batch</p>
                                                <p className="text-sm font-bold text-white">{activeBatch?.name || 'No batch selected'}</p>
                                            </div>
                                            <div className="rounded-xl bg-lime/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-lime">
                                                {batches.length} total
                                            </div>
                                        </div>

                                        <div className="max-h-72 overflow-auto pr-1">
                                            {batches.length === 0 ? (
                                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                                                    No batches available.
                                                </div>
                                            ) : (
                                                batches.map((batch, index) => {
                                                    const isSelected = batch._id === activeBatchId;
                                                    return (
                                                        <motion.button
                                                            key={batch._id}
                                                            type="button"
                                                            onClick={() => handleBatchSelect(batch)}
                                                            initial={{ opacity: 0, x: 6 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.15, delay: index * 0.03 }}
                                                            className={`mb-1 w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-lime/40 bg-lime/15 shadow-[0_0_0_1px_rgba(146,194,17,0.18)]'
                                                                    : 'border-white/10 bg-white/0 hover:border-white/20 hover:bg-white/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className={`text-sm font-bold ${isSelected ? 'text-lime' : 'text-white'}`}>
                                                                        {batch.name}
                                                                    </p>
                                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                                                                        {batch.slug}
                                                                    </p>
                                                                </div>
                                                                {isSelected && (
                                                                    <span className="rounded-full bg-lime px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-navy">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
