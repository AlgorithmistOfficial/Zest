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
import { 
  SiNodedotjs, SiReact, SiExpress, SiAngular, SiTypescript, SiJavascript, 
  SiHtml5, SiNextdotjs, SiPython, SiOpenjdk, SiGithub, 
  SiGitlab, SiTensorflow, SiGoogle, 
  SiOpenai, SiGithubcopilot, SiRedis, SiVercel, SiDocker, SiKotlin,
  SiMongodb, SiGooglegemini
} from 'react-icons/si';
import { FaLinkedin, FaMicrosoft as FaMs } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LogoLoop from './LogoLoop';
import CardSwap, { Card } from './CardSwap';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${
      isScrolled 
        ? 'bg-[#92c211] md:bg-[#92c211]/60 py-1' 
        : 'bg-[#92c211] md:bg-[#92c211]/90 py-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
            <span className="text-white font-bold text-xl tracking-tight">Zest</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/about" className="text-white md:hover:text-[#052340] md:hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition-all font-semibold border border-white/20">Algorithmist Classes</Link>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
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
            className="md:hidden bg-[#92c211] border-b border-white/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/about" className="text-white block px-3 py-2 rounded-md text-base font-medium font-semibold">Algorithmist Classes</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};



const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 perspective-1000">
      {/* Abstract Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Main Floating Card */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_32px_64px_-16px_rgba(5,35,64,0.2)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>

          <div className="flex items-center gap-2 bg-lime/10 px-3 py-1.5 rounded-lg border border-lime/20">
            <Trophy size={14} className="text-navy" />
            <span className="text-xs font-bold text-navy">#12 in Class</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-md">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Binary Search</p>
                <p className="text-xs text-slate-500">Passed in 12ms</p>
              </div>
            </div>
            <span className="text-xs font-bold text-green-600">100%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-navy/10 rounded-md">
                <Code2 size={16} className="text-navy" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Dynamic Programming</p>
                <p className="text-xs text-slate-500">In Progress</p>
              </div>
            </div>
            <span className="text-xs font-bold text-navy">78%</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="font-bold">85%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "85%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-navy to-lime h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge removed from here as it's now integrated inside the card above */}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30">
      <Navbar />

      <main className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-lime/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-navy/5 rounded-full blur-[120px]"></div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse"></span>
                For Algorithmist Students
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-navy tracking-tight leading-[1.1]">
                Master DSA. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-lime">
                  Track Progress.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Zest is the dedicated evaluation platform for Algorithmist DSA classes.
                Take online tests, analyze your performance, and accelerate your learning journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-4 bg-navy text-white font-bold rounded-xl overflow-hidden shadow-lg shadow-navy/20 w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-navy via-navy to-lime opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>

                <Link to="/syllabus" className="px-8 py-4 bg-white border-2 border-navy text-navy font-bold rounded-xl hover:bg-navy hover:text-white transition-all duration-300 shadow-sm inline-block text-center">
                  View Syllabus
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-lime" />
                  <span className="font-medium">Real-time Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-lime" />
                  <span className="font-medium">Instant Feedback</span>
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
      <section className="py-16 bg-slate-50/50 relative border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left lg:pr-8">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-navy mb-6">Why use Zest?</h2>
              <p className="text-slate-600 max-w-lg font-medium leading-relaxed text-lg">
                Designed specifically for the Algorithmist curriculum to ensure you stay on track with your DSA goals.
              </p>
              
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 text-navy/70 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-lime"></div>
                  Real-time Java Evaluation
                </div>
                <div className="flex items-center gap-3 text-navy/70 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-lime"></div>
                  Detailed Performance History
                </div>
                <div className="flex items-center gap-3 text-navy/70 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-lime"></div>
                  Competitive Classroom Rankings
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center mr-[-40px] lg:mr-[-100px] min-h-[520px] pointer-events-none md:pointer-events-auto">
              <CardSwap
                width={500}
                height={350}
                cardDistance={40}
                verticalDistance={50}
                delay={2600}
                pauseOnHover={true}
                skewAmount={2}
              >
              <Card style={{ backgroundColor: '#eff6ff' }}>
                <div className="card-icon-wrapper">
                  <Code2 size={32} />
                </div>
                <h3>Practice Java</h3>
                <p>Sharpen your coding skills with our integrated online Java compiler. Get instant results and detailed error highlights directly in your browser.</p>
                <div className="card-number">01</div>
              </Card>
              <Card style={{ backgroundColor: '#f0fdf4' }}>
                <div className="card-icon-wrapper">
                  <BarChart3 size={32} />
                </div>
                <h3>Progress Tracking</h3>
                <p>Visualize your growth with comprehensive performance analytics. Track your test history, accuracy rates, and topic-wise mastery over time.</p>
                <div className="card-number">02</div>
              </Card>
              <Card style={{ backgroundColor: '#fffbeb' }}>
                <div className="card-icon-wrapper">
                  <Trophy size={32} />
                </div>
                <h3>Leaderboards</h3>
                <p>Fuel your motivation by competing with your peers. See where you stand in the Algorithmist class and challenge yourself to climb the ranks.</p>
                <div className="card-number">03</div>
              </Card>
            </CardSwap>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Loop Section */}
      <section className="py-20 bg-[#fffef2] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
          <h2 className="text-2xl font-bold text-navy/40 uppercase tracking-[0.2em] mb-4">Powering the Future</h2>
          <div className="w-12 h-1 bg-lime/30 mx-auto rounded-full"></div>
        </div>
        <LogoLoop
          logos={[
            { node: <SiNodedotjs />, title: "Node.js" },
            { node: <SiReact />, title: "React" },
            { node: <SiExpress />, title: "Express.js" },
            { node: <SiAngular />, title: "Angular" },
            { node: <SiTypescript />, title: "TypeScript" },
            { node: <SiJavascript />, title: "JavaScript" },
            { node: <SiHtml5 />, title: "HTML5" },
            { node: <SiNextdotjs />, title: "Next.js" },
            { node: <SiPython />, title: "Python" },
            { node: <SiOpenjdk />, title: "Java" },
            { node: <SiGithub />, title: "GitHub" },
            { node: <SiGitlab />, title: "GitLab" },
            { node: <SiTensorflow />, title: "TensorFlow" },
            { node: <FaLinkedin />, title: "LinkedIn" },
            { node: <FaMs />, title: "Microsoft" },
            { node: <SiGoogle />, title: "Google" },
            { node: <SiGooglegemini />, title: "Gemini" },
            { node: <SiOpenai />, title: "OpenAI" },
            { node: <SiGithubcopilot />, title: "GitHub Copilot" },
            { node: <SiRedis />, title: "Redis" },
            { node: <SiMongodb />, title: "MongoDB" },
            { node: <SiVercel />, title: "Vercel" },
            { node: <SiDocker />, title: "Docker" },
            { node: <SiKotlin />, title: "Kotlin" },
          ]}
          speed={30}
          direction="left"
          logoHeight={45}
          gap={80}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
        />
      </section>

      <footer className="py-12 bg-navy text-white text-center px-4 mt-20">
        <p className="font-medium leading-relaxed opacity-80">
          <span className="block md:inline">&copy; {new Date().getFullYear()} <span className="font-bold text-white">Shreyansh Srivastava</span></span>
          <span className="hidden md:inline"> . </span>
          <span className="block md:inline uppercase tracking-wider text-[10px] md:text-sm md:normal-case font-bold md:font-medium">For Algorithmist DSA Classes</span>
        </p>
      </footer>
    </div>
  );
}
