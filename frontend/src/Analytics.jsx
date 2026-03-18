import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
                        <Link to="/home" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                            <ArrowLeft size={20} />
                            <span className="font-bold">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
                            <span className="text-white font-bold text-xl tracking-tight">Zest</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4 pt-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 bg-lime/10 rounded-3xl flex items-center justify-center text-lime mx-auto mb-8">
                        <BarChart3 size={48} />
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-4 text-slate-400">
                        <Construction size={20} />
                        <span className="font-bold uppercase tracking-widest text-sm">Feature Coming Soon</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-navy mb-4">Performance Analytics</h1>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Insights into your DSA progress, topic-wise mastery, and test trends will appear here. We're busy crunching the numbers for you!
                    </p>
                    <Link to="/home">
                        <button className="px-8 py-3 bg-navy text-white font-bold rounded-2xl hover:bg-navy/90 transition-all shadow-lg shadow-navy/10">
                            Return Home
                        </button>
                    </Link>
                </motion.div>
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
