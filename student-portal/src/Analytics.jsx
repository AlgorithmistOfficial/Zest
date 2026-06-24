import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, LogOut, TrendingUp, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Analytics = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

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

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/student/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [navigate]);

    const attempts = useMemo(() => data?.attempts || [], [data?.attempts]);
    const chartMax = useMemo(() => {
        const maxScore = attempts.reduce((m, a) => Math.max(m, a.score > 0 ? a.score : 0), 0);
        return Math.max(100, maxScore);
    }, [attempts]);

    const linePoints = useMemo(() => {
        if (!attempts.length) return '';
        const width = 700;
        const height = 220;
        const step = attempts.length > 1 ? width / (attempts.length - 1) : width;
        return attempts
            .map((a, i) => {
                const normalized = a.score < 0 ? 0 : a.score;
                const x = i * step;
                const y = height - (normalized / chartMax) * height;
                return `${x},${y}`;
            })
            .join(' ');
    }, [attempts, chartMax]);

    return (
        <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col overflow-x-hidden">
            <Helmet>
                <title>Zest - Analytics</title>
            </Helmet>

            {/* Navigation */}
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
                            {/* Desktop Nav Links shifted to right */}
                            <div className="hidden md:flex items-center gap-8 mr-4">
                                <Link to="/profile" className="text-white nav-hover-draw px-1 py-2 text-lg tracking-tight transition-all">Profile</Link>
                                <Link to="/analytics" className="text-white nav-hover-underline underline-offset-8 decoration-2 px-1 py-2 text-lg tracking-tight transition-all">Analytics</Link>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-bold"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-white"
                            >
                                <div className="w-6 h-5 flex flex-col justify-between">
                                    <span className={`h-1 w-full bg-white rounded-full transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                    <span className={`h-1 w-full bg-white rounded-full transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`h-1 w-full bg-white rounded-full transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden bg-lime transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 border-b border-white/20' : 'max-h-0'}`}>
                    <div className="px-4 py-6 space-y-4">
                        <Link to="/profile" className="block text-white font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                        <Link to="/analytics" className="block text-white font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>Analytics</Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-white font-bold text-lg pt-4 border-t border-white/20 w-full"
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 p-4 pt-32">
                <div className="max-w-6xl mx-auto space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="text-lime" />
                            <h1 className="text-3xl font-black">Performance Analytics</h1>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Track your marks test by test and identify strong and weak tests.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-slate-500 font-medium">Loading analytics...</div>
                    ) : !attempts.length ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-slate-500 font-medium">No test attempts found yet.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Student</p>
                                    <p className="text-2xl font-black mt-2">{data.studentName}</p>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Tests Taken</p>
                                    <p className="text-2xl font-black mt-2">{attempts.length}</p>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Average Percentage</p>
                                    <p className="text-2xl font-black mt-2">{data.averagePercentage}%</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm overflow-x-auto">
                                <p className="font-bold mb-4">Bar Graph: Marks in each test</p>
                                <div className="min-w-[780px] h-72 flex items-end gap-3">
                                    {attempts.map((a) => {
                                        const normalized = a.score < 0 ? 0 : a.score;
                                        const h = Math.max(6, Math.round((normalized / chartMax) * 220));
                                        return (
                                            <div key={`${a.testId}-${a.index}`} className="flex flex-col items-center w-14">
                                                <span className={`text-xs font-bold mb-2 ${a.score === -1 ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {a.score === -1 ? 'ABS' : a.score}
                                                </span>
                                                <div className={`${a.score === -1 ? 'bg-red-400' : 'bg-lime'} w-10 rounded-t-lg`} style={{ height: `${h}px` }} />
                                                <span className="text-[10px] text-slate-500 mt-2 font-bold">{a.testId}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm overflow-x-auto">
                                <p className="font-bold mb-4">Curve Graph: Score trend over time</p>
                                <div className="min-w-[780px]">
                                    <svg width="700" height="240" viewBox="0 0 700 240" className="w-full">
                                        <line x1="0" y1="220" x2="700" y2="220" stroke="#cbd5e1" strokeWidth="2" />
                                        <polyline
                                            fill="none"
                                            stroke="#92c211"
                                            strokeWidth="3"
                                            points={linePoints}
                                        />
                                        {attempts.map((a, i) => {
                                            const step = attempts.length > 1 ? 700 / (attempts.length - 1) : 700;
                                            const x = i * step;
                                            const y = 220 - ((a.score < 0 ? 0 : a.score) / chartMax) * 220;
                                            return (
                                                <g key={`pt-${a.testId}-${i}`}>
                                                    <circle cx={x} cy={y} r="5" fill={a.score === -1 ? '#ef4444' : '#0f172a'} />
                                                    <text x={x} y={236} textAnchor="middle" fontSize="10" fill="#64748b">{a.testId}</text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                    <p className="font-bold mb-4 flex items-center gap-2 text-green-700"><TrendingUp size={18} /> High-scoring tests</p>
                                    <ul className="space-y-2">
                                        {(data.highScoringTests || []).length ? data.highScoringTests.map((t, idx) => (
                                            <li key={`${t.testId}-${idx}`} className="text-sm text-slate-700">
                                                <span className="font-bold">{t.examName}</span> ({t.testId}) - {t.score} marks
                                            </li>
                                        )) : <li className="text-sm text-slate-500">No high-scoring tests yet.</li>}
                                    </ul>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                                    <p className="font-bold mb-4 flex items-center gap-2 text-red-600"><TrendingDown size={18} /> Low-scoring / absent tests</p>
                                    <ul className="space-y-2">
                                        {(data.lowScoringTests || []).length ? data.lowScoringTests.map((t, idx) => (
                                            <li key={`${t.testId}-${idx}`} className="text-sm text-slate-700">
                                                <span className="font-bold">{t.examName}</span> ({t.testId}) - {t.score === -1 ? 'Absent' : `${t.score} marks`}
                                            </li>
                                        )) : <li className="text-sm text-slate-500">No low-scoring tests.</li>}
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="py-12 bg-navy text-white text-center px-4">
                <p className="font-medium leading-relaxed opacity-80">
                    &copy; {new Date().getFullYear()} <span className="font-bold">Shreyansh Srivastava</span> . For Algorithmist DSA Classes
                </p>
            </footer>
        </div>
    );
};

export default Analytics;
