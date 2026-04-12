import React from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  ArrowRight,
  BookOpen,
  Code,
  Trophy,
  Calendar,
  Clock,
  Timer,
  Award,
  AlertCircle,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  React.useEffect(() => {
    // Redirect if not logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/auth');
  };

  const [entryAlert, setEntryAlert] = React.useState(null); // { type: 'early' | 'late' }

  const handleStartTest = () => {
    if (!upcomingTest) return;

    const now = new Date();
    const startTime = upcomingTest.startAt;
    const entryDeadline = new Date(startTime.getTime() + 5 * 60 * 1000); // 5 minutes extra

    if (now < startTime) {
      setEntryAlert({ type: 'early' });
    } else if (now > entryDeadline) {
      setEntryAlert({ type: 'late' });
    } else {
      // Within window (or for debugging, you can add an override here)
      navigate(`/test/${upcomingTest.testId}`);
    }
  };

  const dashboardItems = [
    { title: "Syllabus", icon: BookOpen, path: "/syllabus", color: "bg-blue-500", hoverBg: "hover:bg-blue-50", hoverBorder: "hover:border-blue-200" },
    { title: "Practice", icon: Code, path: "/practice", color: "bg-lime", hoverBg: "hover:bg-lime/10", hoverBorder: "hover:border-lime/30" },
    { title: "Leaderboard", icon: Trophy, path: "/leaderboard", color: "bg-yellow-500", hoverBg: "hover:bg-yellow-50", hoverBorder: "hover:border-yellow-200" },
    { title: "Schedule", icon: Calendar, path: "/schedule", color: "bg-purple-500", hoverBg: "hover:bg-purple-50", hoverBorder: "hover:border-purple-200" },
  ];

  const [upcomingTest, setUpcomingTest] = React.useState(null);

  React.useEffect(() => {
    const fetchNearestTest = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
        const res = await fetch(`${backendUrl}/api/exams`);
        if (!res.ok) return;
        const exams = await res.json();
        console.log('[Home] Fetched exams:', exams);

        // Fetch student's already-submitted test IDs
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        let submittedTestIds = [];
        if (token) {
          try {
            const studentRes = await fetch(`${backendUrl}/api/student/submitted-tests`, {
              headers: { 'Authorization': `Bearer ${token}` },
              credentials: 'include'
            });
            console.log('[Home] submitted-tests response status:', studentRes.status);
            if (studentRes.ok) {
              const studentData = await studentRes.json();
              submittedTestIds = studentData.submittedTestIds || [];
              console.log('[Home] Student has submitted these testIds:', submittedTestIds);
            } else {
              const errBody = await studentRes.text();
              console.warn('[Home] submitted-tests fetch failed:', studentRes.status, errBody);
            }
          } catch (e) {
            console.error('[Home] Failed to fetch submitted tests:', e);
          }
        }

        const now = new Date();

        const parseDateTime = (d, t) => {
          const ds = d.toString().padStart(8, '0');
          const ts = t.toString().padStart(6, '0');
          return new Date(
            parseInt(ds.slice(4)), // yyyy
            parseInt(ds.slice(2, 4)) - 1, // mm
            parseInt(ds.slice(0, 2)), // dd
            parseInt(ts.slice(0, 2)), // hh
            parseInt(ts.slice(2, 4)), // mm
            parseInt(ts.slice(4)) // ss
          );
        };

        const activeExams = exams
          .filter(e => e.status === 'scheduled' || e.status === 'ongoing')
          .filter(e => !submittedTestIds.includes(e.testId)) // Skip already-submitted tests
          .map(e => ({ ...e, startAt: parseDateTime(e.examDate, e.examTime) }))
          .sort((a, b) => a.startAt - b.startAt);

        console.log('[Home] Active exams (excluding submitted):', activeExams);

        // Prioritize: ongoing test first, then next scheduled test
        const ongoingTest = activeExams.find(e => e.status === 'ongoing');
        const nextScheduled = activeExams.find(e => e.startAt > now);
        const bestTest = ongoingTest || nextScheduled;

        if (bestTest) {
          console.log('[Home] Best test selected:', bestTest.examName, '| Status:', bestTest.status);
          setUpcomingTest(bestTest);
        }
      } catch (err) {
        console.error('Failed to fetch nearest test:', err);
      }
    };
    fetchNearestTest();
  }, []);


  const fmtDate = (n) => {
    const s = n.toString().padStart(8, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(s.slice(0, 2))} ${months[parseInt(s.slice(2, 4)) - 1]} ${s.slice(4)}`;
  };

  const fmtTime = (n) => {
    const s = n.toString().padStart(6, '0');
    let hh = parseInt(s.slice(0, 2));
    const mm = s.slice(2, 4);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${mm} ${ampm}`;
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-navy">
              {(() => {
                const hour = new Date().getHours();
                if (hour >= 4 && hour < 12) return 'Good Morning';
                if (hour >= 12 && hour < 16) return 'Good Afternoon';
                if (hour >= 16 && hour < 20) return 'Good Evening';
                return 'Hello';
              })()}, <span className="text-lime">{user.name || 'Student'}</span>! 👋
            </h1>
            <p className="text-slate-600 text-lg">
              Pick up right where you left off in your DSA journey.
            </p>
          </motion.div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`block p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group ${item.hoverBg} ${item.hoverBorder}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                  <div className="flex items-center text-lime font-bold gap-2">
                    Explore <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Upcoming Test Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 p-12 bg-navy rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-transparent transition-colors shadow-2xl shadow-navy/20 relative z-10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Upcoming Test</h2>
              </div>
              {upcomingTest ? (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-lime">{upcomingTest.examName}</h3>
                  <div className="flex flex-wrap gap-4 text-slate-300 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-lime" />
                      {fmtDate(upcomingTest.examDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-lime" />
                      {fmtTime(upcomingTest.examTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer size={16} className="text-lime shrink-0" />
                      {upcomingTest.duration} Min
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-lime shrink-0" />
                      {upcomingTest.totalMarks} Marks
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {upcomingTest.topics.slice(0, 10).map((topic, i) => (
                      <span key={i} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                        {topic}
                      </span>
                    ))}
                    {upcomingTest.topics.length > 10 && <span className="text-xs text-slate-400">+{upcomingTest.topics.length - 10} more</span>}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-medium italic">No upcoming exams recently scheduled.</p>
              )}
            </div>

            {upcomingTest && (
              <div className="w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartTest}
                  className="w-full px-10 py-4 bg-lime text-white font-extrabold rounded-2xl hover:bg-lime/90 transition-all flex items-center justify-center gap-2"
                >
                  Start Test <ArrowRight size={20} />
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Entry Timing Alerts */}
          <AnimatePresence>
            {entryAlert && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEntryAlert(null)}
                  className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
                >
                  {/* Background Accents */}
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -mr-16 -mt-16 ${entryAlert.type === 'early' ? 'bg-blue-500' : 'bg-red-500'}`} />
                  
                  <button 
                    onClick={() => setEntryAlert(null)}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${
                      entryAlert.type === 'early' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <AlertCircle size={40} />
                    </div>

                    <h3 className="text-2xl font-extrabold text-navy mb-4">
                      {entryAlert.type === 'early' ? "Test hasn't started yet" : "Entry Window Closed"}
                    </h3>
                    
                    <p className="text-slate-600 font-medium leading-relaxed mb-8">
                      {entryAlert.type === 'early' 
                        ? `This test is scheduled to begin at ${fmtTime(upcomingTest.examTime)}. Please wait for the start signal.`
                        : "The 5-minute entry window for this test has expired. Late entries are strictly prohibited by secure protocols."
                      }
                    </p>

                    <button
                      onClick={() => setEntryAlert(null)}
                      className={`w-full py-4 rounded-2xl font-extrabold text-white transition-all shadow-lg ${
                        entryAlert.type === 'early' ? 'bg-blue-600 shadow-blue-200' : 'bg-red-600 shadow-red-200'
                      }`}
                    >
                      Understood
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-12 bg-navy text-white text-center px-4 mt-20">
        <p className="font-medium leading-relaxed opacity-80">
          <span className="block md:inline">&copy; {new Date().getFullYear()} <span className="font-bold text-white">Shreyansh Srivastava</span></span>
          <span className="hidden md:inline"> . </span>
          <span className="block md:inline uppercase tracking-wider text-[10px] md:text-sm md:normal-case font-bold md:font-medium">For Algorithmist DSA Classes</span>
        </p>
      </footer>
    </div>
  );
};

export default Home;
