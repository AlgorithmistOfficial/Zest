import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Code,
  Layers,
  Activity,
  Search,
  TreePine,
  GitBranch,
  Zap,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { clearAuthSession } from './authStorage';

const SyllabusCard = ({ title, icon: Icon, topics, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center text-navy group-hover:bg-lime group-hover:text-white transition-colors duration-300">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-navy">{title}</h3>
    </div>
    <ul className="space-y-2">
      {topics.map((topic, index) => (
        <li key={index} className="flex items-center gap-2 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-lime"></div>
          {topic}
        </li>
      ))}
    </ul>
  </motion.div>
);

const Syllabus = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/auth');
  };

  const syllabusData = [
    {
      title: "Complexity Analysis",
      icon: Activity,
      topics: ["Asymptotic Notations", "Big O, Omega, Theta", "Time Complexity", "Space Complexity"]
    },
    {
      title: "Arrays & Strings",
      icon: Code,
      topics: ["Memory Layout", "Two Pointers", "Sliding Window", "String Algorithms"]
    },
    {
      title: "Linked Lists",
      icon: Layers,
      topics: ["Singly Linked List", "Doubly Linked List", "Circular List", "Fast & Slow Pointers"]
    },
    {
      title: "Stacks & Queues",
      icon: Zap,
      topics: ["LIFO/FIFO", "Monotonic Stack", "Priority Queue", "Deque Operations"]
    },
    {
      title: "Searching & Sorting",
      icon: Search,
      topics: ["Binary Search", "Quick Sort", "Merge Sort", "Counting Sort"]
    },
    {
      title: "Trees",
      icon: TreePine,
      topics: ["Binary Trees", "BST Operations", "Heaps", "Traversals (DFS/BFS)"]
    },
    {
      title: "Graphs",
      icon: GitBranch,
      topics: ["Representations", "Dijkstra's", "MST (Prim/Kruskal)", "Topological Sort"]
    },
    {
      title: "Advanced Topics",
      icon: BookOpen,
      topics: ["Dynamic Programming", "Greedy Algorithms", "Recursion", "Backtracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col overflow-x-hidden">
      <Helmet>
        <title>Zest - Syllabus</title>
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-navy">Master the DSA Roadmap</h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Follow our comprehensive curriculum designed to take you from a beginner to an algorithmic expert.
            </p>
            <div className="w-24 h-1.5 bg-lime mx-auto rounded-full mt-8"></div>
          </motion.div>

          {/* Syllabus Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {syllabusData.map((section, index) => (
              <SyllabusCard
                key={index}
                {...section}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Footer Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 p-12 bg-navy rounded-[3rem] text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Practicing?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Our online platform provides real-time evaluations and progress tracking for every topic listed above.
            </p>
            <Link
              to="/"
              className="px-8 py-4 bg-lime text-navy font-bold rounded-2xl hover:scale-105 transition-transform inline-block"
            >
              Get Started Now
            </Link>
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

export default Syllabus;
