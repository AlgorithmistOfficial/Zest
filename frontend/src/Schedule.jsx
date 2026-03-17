import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Schedule = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${isScrolled
        ? 'bg-[#92c211] md:bg-[#92c211]/60 py-1'
        : 'bg-[#92c211] md:bg-[#92c211]/90 py-0'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <ArrowLeft size={20} />
              <span className="font-bold">Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold text-xl tracking-tight">Zest</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-lime/10 flex items-center justify-center text-navy mb-8">
              <Calendar size={40} />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-navy">Class Schedule</h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Under Development</p>
            </div>
            <p className="mt-8 text-slate-500 max-w-lg mx-auto">
              Our class planning system is on the way. Soon you'll be able to view session timings and upcoming lectures for the Algorithmist DSA classes.
            </p>
          </motion.div>
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
