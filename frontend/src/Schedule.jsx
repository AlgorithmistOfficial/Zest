import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Award, Timer, AlertCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'https://Shreyansh6726-zest.hf.space';

const Schedule = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const fetchExams = async () => {
      try {
        const res = await fetch(`${API_URL}/api/exams`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setExams(data);
      } catch (err) {
        setError('Unable to load exam schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const fmtDate = (n) => {
    const s = n.toString().padStart(8, '0');
    const dd = s.slice(0, 2), mm = s.slice(2, 4), yyyy = s.slice(4);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(dd)} ${months[parseInt(mm) - 1]} ${yyyy}`;
  };

  const fmtTime = (n) => {
    const s = n.toString().padStart(6, '0');
    let hh = parseInt(s.slice(0, 2));
    const mm = s.slice(2, 4);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${mm} ${ampm}`;
  };

  const diffStyle = {
    easy:   'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard:   'bg-red-100 text-red-700',
  };

  const statusStyle = {
    scheduled: 'bg-blue-100 text-blue-700',
    ongoing:   'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-navy">Upcoming Exams</h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              View all scheduled evaluations for the Algorithmist DSA classes. Prepare well and ace your tests!
            </p>
            <div className="w-24 h-1.5 bg-lime mx-auto rounded-full mt-8"></div>
          </motion.div>

          {/* Content */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-lime/30 border-t-lime rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-semibold">Loading exam schedule…</p>
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-w-lg mx-auto bg-red-50 text-red-600 p-5 rounded-2xl font-bold flex items-center gap-3 border border-red-100">
              <AlertCircle size={20} /> {error}
            </motion.div>
          )}

          {!loading && !error && exams.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-lime/10 flex items-center justify-center text-navy mx-auto mb-6">
                <Calendar size={40} />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">No Exams Scheduled</h2>
              <p className="text-slate-500 max-w-md mx-auto">There are no upcoming tests at the moment. Check back soon!</p>
            </motion.div>
          )}

          {!loading && !error && exams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam, idx) => (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Top row: name + badges */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-navy">{exam.examName}</h3>
                    <div className="flex gap-2 shrink-0">
                      <span className={`${diffStyle[exam.difficultyLevel]} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                        {exam.difficultyLevel}
                      </span>
                      <span className={`${statusStyle[exam.status]} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                        {exam.status}
                      </span>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-lime shrink-0" />
                      <span className="font-semibold">{fmtDate(exam.examDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={14} className="text-lime shrink-0" />
                      <span className="font-semibold">{fmtTime(exam.examTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Timer size={14} className="text-lime shrink-0" />
                      <span className="font-semibold">{exam.duration} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Award size={14} className="text-lime shrink-0" />
                      <span className="font-semibold">{exam.totalMarks} Marks (Pass: {exam.passingMarks})</span>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2">
                    {exam.topics.map((topic, i) => (
                      <span key={i} className="bg-lime/10 text-navy text-xs font-bold px-2.5 py-1 rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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

export default Schedule;
