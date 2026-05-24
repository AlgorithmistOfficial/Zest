import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Crown, Star, User, Target, AlertCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const selectedBatchId = user.batchId || (user.batch && user.batch._id) || user.batch?.id || '';
    const selectedBatchName = user.batch?.name || 'your batch';

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
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${API_URL}/api/leaderboard${selectedBatchId ? `?batchId=${selectedBatchId}` : ''}`);
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                const data = await res.json();
                setRankings(data);
            } catch (err) {
                setError('Unable to load leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [selectedBatchId]);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="text-yellow-500" size={24} />;
        if (index === 1) return <Medal className="text-slate-400" size={24} />;
        if (index === 2) return <Medal className="text-amber-600" size={24} />;
        return <span className="font-bold text-slate-400">#{index + 1}</span>;
    };

    const getRowStyle = (index) => {
        if (index === 0) return "bg-yellow-50/50 border-yellow-200 shadow-yellow-100";
        if (index === 1) return "bg-slate-50/50 border-slate-200 shadow-slate-100";
        if (index === 2) return "bg-orange-50/50 border-orange-200 shadow-orange-100";
        return "bg-white border-slate-100 shadow-sm";
    };

    return (
        <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col overflow-x-hidden">
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
                                <Link to="/analytics" className="text-white nav-hover-draw px-1 py-2 text-lg tracking-tight transition-all">Analytics</Link>
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

            <main className="pt-32 pb-20 px-4 flex-1">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-lime/10 flex items-center justify-center text-navy mx-auto mb-6">
                            <Trophy size={40} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-navy">Global Rankings</h1>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{selectedBatchName}</p>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            The best of Algorithmist DSA classes. Keep practicing to climb the ranks!
                        </p>
                        <div className="w-24 h-1.5 bg-lime mx-auto rounded-full mt-8"></div>
                    </motion.div>

                    {/* Stats Summary */}
                    {!loading && !error && rankings.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Top Performer</p>
                                <p className="text-lg font-bold text-navy">{rankings[0].name}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Score</p>
                                <p className="text-lg font-bold text-navy">
                                    {Math.round(rankings.reduce((acc, curr) => acc + curr.totalScore, 0) / rankings.length)}
                                </p>
                            </div>
                            <div className="hidden md:block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Active</p>
                                <p className="text-lg font-bold text-navy">{rankings.length} Students</p>
                            </div>
                        </div>
                    )}

                    {/* Leaderboard Table Content */}
                    <div className="space-y-3">
                        {loading && (
                            <div className="text-center py-20">
                                <div className="w-12 h-12 border-4 border-lime/30 border-t-lime rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500 font-semibold">Calculating rankings…</p>
                            </div>
                        )}

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold flex items-center gap-3 border border-red-100">
                                <AlertCircle size={20} /> {error}
                            </motion.div>
                        )}

                        {!loading && !error && rankings.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <Star className="mx-auto text-slate-200 mb-4" size={48} />
                                <h2 className="text-xl font-bold text-navy">No rankings yet</h2>
                                <p className="text-slate-400">Complete an exam to see your name here!</p>
                            </div>
                        )}

                        {!loading && !error && rankings.slice(0, 3).map((student, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all hover:scale-[1.01] ${getRowStyle(index)}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-inner relative overflow-hidden">
                                        {student.profilePicture ? (
                                            <img src={student.profilePicture} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                        ) : (
                                            getRankIcon(index)
                                        )}
                                        {student.profilePicture && (
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm scale-75">
                                                {getRankIcon(index)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-navy leading-none mb-1">{student.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <Target size={12} /> {student.testsTaken} Tests Completed
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-navy">{student.totalScore}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Pts</div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Remaining Ranks */}
                        {!loading && !error && rankings.slice(3).map((student, index) => (
                            <motion.div
                                key={index + 3}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: (index + 3) * 0.05 }}
                                className="flex items-center justify-between p-4 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-lime/30 transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-8 text-center">
                                        <span className="text-sm font-bold text-slate-300">#{index + 4}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden">
                                            {student.profilePicture ? (
                                                <img src={student.profilePicture} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-navy">{student.name}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{student.testsTaken} tests</p>
                                    </div>
                                    <div className="w-16 text-right font-bold text-navy">
                                        {student.totalScore}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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

export default Leaderboard;
