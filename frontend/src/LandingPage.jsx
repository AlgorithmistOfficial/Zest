import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  BarChart3, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X 
} from 'lucide-react';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Zest</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</a>
              <a href="#" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Tests</a>
              <a href="#" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Progress</a>
              <a href="#" className="text-blue-400 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Algorithmist Classes</a>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
              <a href="#" className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Tests</a>
              <a href="#" className="text-blue-400 block px-3 py-2 rounded-md text-base font-medium">Algorithmist Classes</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors group"
  >
    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
      <Icon className="text-slate-400 group-hover:text-blue-400 transition-colors" size={24} />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 perspective-1000">
      {/* Abstract Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Main Floating Card */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs font-mono text-slate-500">test_results.json</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-md">
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Binary Search</p>
                <p className="text-xs text-slate-400">Passed in 12ms</p>
              </div>
            </div>
            <span className="text-xs font-bold text-green-400">100%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Code2 size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Dynamic Programming</p>
                <p className="text-xs text-slate-400">In Progress</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-400">78%</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Overall Progress</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "85%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Badge */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -right-4 top-10 bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-lg flex items-center gap-3"
      >
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <Trophy size={20} className="text-yellow-500" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Rank</p>
          <p className="text-sm font-bold text-white">#12 in Class</p>
        </div>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                For Algorithmist Students
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                Master DSA. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Track Progress.
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                Zest is the dedicated evaluation platform for Algorithmist DSA classes. 
                Take online tests, analyze your performance, and accelerate your learning journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-lg overflow-hidden shadow-lg shadow-white/10"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 w-full h-full border-2 border-white/20 group-hover:border-transparent transition-colors"></div>
                  <span className="relative flex items-center gap-2">
                    Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                
                <button className="px-8 py-4 bg-transparent border border-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                  View Syllabus
                </button>
              </div>

              <div className="pt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-slate-400" />
                  <span>Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-slate-400" />
                  <span>Instant Feedback</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why use Zest?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Designed specifically for the Algorithmist curriculum to ensure you stay on track with your DSA goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Code2}
              title="Online Evaluations"
              desc="Participate in timed coding tests directly from the platform. Supports multiple languages and auto-grading."
              delay={0.1}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Progress Tracking"
              desc="Visualize your improvement over time with detailed charts and performance metrics."
              delay={0.2}
            />
            <FeatureCard 
              icon={Trophy}
              title="Leaderboards"
              desc="Compete with your peers in the Algorithmist class to boost motivation and learning speed."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Zest Platform. For Algorithmist DSA Classes.</p>
      </footer>
    </div>
  );
}
