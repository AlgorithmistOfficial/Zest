import React from 'react';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  ArrowRight, 
  BookOpen, 
  Code, 
  Trophy,
  Calendar
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

  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30">
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
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-bold"
            >
              <LogOut size={18} />
              <span>Logout</span>
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
              Welcome back, <span className="text-lime">{user.name || 'Student'}</span>! 👋
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

          {/* Activity Section Placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 p-12 bg-navy rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-4">Your Progress</h2>
              <p className="text-slate-300 max-w-md">
                Keep practicing to reach the top of the leaderboard! Your personalized stats and recent problems will appear here soon.
              </p>
            </div>
            <div className="w-full md:w-64 h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-lime"
              />
            </div>
          </motion.div>
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
