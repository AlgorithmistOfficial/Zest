import React from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  ArrowRight,
  BookOpen,
  Code,
  Trophy,
  Calendar,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/auth');
  };

  const dashboardItems = [
    { title: "Syllabus", icon: BookOpen, path: "/syllabus", color: "bg-blue-500" },
    { title: "Practice", icon: Code, path: "/practice", color: "bg-lime" },
    { title: "Leaderboard", icon: Trophy, path: "/leaderboard", color: "bg-yellow-500" },
    { title: "Schedule", icon: Calendar, path: "/schedule", color: "bg-purple-500" },
  ];

  const [upcomingTest, setUpcomingTest] = React.useState(null);
  const [isSoon, setIsSoon] = React.useState(false);

  React.useEffect(() => {
    const fetchNearestTest = async () => {
      try {
        const res = await fetch('https://Shreyansh6726-zest.hf.space/api/exams');
        if (!res.ok) return;
        const exams = await res.json();
        console.log('[Home] Fetched exams:', exams);

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
          .map(e => ({ ...e, startAt: parseDateTime(e.examDate, e.examTime) }))
          .sort((a, b) => a.startAt - b.startAt);

        console.log('[Home] All active exams sorted:', activeExams);

        // Logic to find the "best" test to show:
        // 1. First upcoming test (startAt > now)
        // 2. Or the most recent ongoing/scheduled test that started today
        const upcoming = activeExams.find(e => e.startAt > now);
        const mostRecentStarted = [...activeExams].reverse().find(e => e.startAt <= now);

        const bestTest = upcoming || mostRecentStarted;
        
        if (bestTest) {
          console.log('[Home] Best test selected:', bestTest.examName);
          setUpcomingTest(bestTest);
        }
      } catch (err) {
        console.error('Failed to fetch nearest test:', err);
      }
    };
    fetchNearestTest();
  }, []);

  // Handle Web Push Notifications
  React.useEffect(() => {
    const subscribeToPush = async () => {
      // Only subscribe if "Remember Me" (persistent) is enabled
      const isPersistent = localStorage.getItem('rememberMe') === 'true';
      if (!isPersistent) return;

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          const publicVapidKey = 'BOTRe2gEPZ0JryyOujmFxMhl7PvT4n0aYZmVpqpQoJkMYKPExQUEzzcziRL53r6I2nuQ5FStp7JdETMec6TXIu0';
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey
          });
        }

        // Send subscription to backend
        await fetch('https://Shreyansh6726-zest.hf.space/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            studentEmail: user.email
          })
        });
        
        console.log('[Push] Subscribed to notifications');
      } catch (err) {
        console.error('[Push] Failed to subscribe:', err);
      }
    };

    if (user.email) {
      subscribeToPush();
    }
  }, [user.email]);

  // Check if test is soon (within 10 mins) for UI pulsing effect
  React.useEffect(() => {
    if (!upcomingTest) return;

    const checkSoon = () => {
      const now = new Date();
      const diff = upcomingTest.startAt - now;
      setIsSoon(diff > 0 && diff < 10 * 60 * 1000);
    };

    checkSoon();
    const interval = setInterval(checkSoon, 30000);
    return () => clearInterval(interval);
  }, [upcomingTest]);

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
                  className="block p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
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

          {/* Upcoming Test Section Container */}
          <div className="relative mt-12 w-full">
            {isSoon && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 border-[6px] border-lime/40 rounded-[3rem] z-0"
                />
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                  className="absolute inset-0 border-[4px] border-lime/20 rounded-[3rem] z-0"
                />
              </>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="p-12 bg-navy rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-transparent transition-colors shadow-2xl shadow-navy/20 relative z-10"
              style={isSoon ? { borderColor: 'rgba(146, 194, 17, 0.7)' } : {}}
            >
              <div>
                <h2 className="text-3xl font-bold mb-4">Upcoming Test</h2>
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
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {upcomingTest.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                          {topic}
                        </span>
                      ))}
                      {upcomingTest.topics.length > 3 && <span className="text-xs text-slate-400">+{upcomingTest.topics.length - 3} more</span>}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 font-medium italic">No upcoming exams recently scheduled.</p>
                )}
              </div>

              {upcomingTest && (
                <Link to="/practice" className="w-full md:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-10 py-4 bg-lime text-white font-extrabold rounded-2xl hover:bg-lime/90 transition-all flex items-center justify-center gap-2"
                  >
                    Start Test <ArrowRight size={20} />
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </div>
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
