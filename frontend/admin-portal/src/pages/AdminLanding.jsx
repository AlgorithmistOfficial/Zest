import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const AdminLanding = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page min-h-screen flex flex-col overflow-hidden">
            <Helmet>
                <title>Zest | Administration Suite</title>
                <meta name="description" content="A focused administration suite for managing assessments at Algorithmist Academy." />
            </Helmet>

            <nav className={`landing-header fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${isScrolled
                ? 'bg-lime/60 py-1'
                : 'bg-lime/90 py-0'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
                        <span className="text-white font-bold text-xl tracking-tight">Zest</span>
                    </div>
                    </div>
                </div>
            </nav>

            <main className="relative flex-1 flex items-center pt-16">
                <div className="landing-grid" aria-hidden="true" />
                <div className="landing-glow" aria-hidden="true" />
                <motion.div
                    className="landing-orbit"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    aria-hidden="true"
                />

                <div className="max-w-7xl w-full mx-auto px-6 lg:px-10 py-20 lg:py-28 relative z-10">
                    <div className="max-w-4xl">
                        <motion.p
                            className="landing-eyebrow"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            A clearer standard for academic operations
                        </motion.p>
                        <motion.h1
                            className="landing-title"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.1 }}
                        >
                            <span className="landing-title-muted">Structure every assessment.</span>
                            <span> Elevate every outcome.</span>
                        </motion.h1>
                        <motion.p
                            className="landing-quote"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.22 }}
                        >
                            "The quality of an institution is reflected in the care with which it prepares, measures, and improves the journey of every learner."
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.36 }}
                        >
                            <button type="button" className="landing-cta" onClick={() => navigate('/manage-exams')}>
                                Get Started
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </div>

                    <motion.div
                        className="landing-principles grid md:grid-cols-3 gap-5 mt-24 lg:mt-32"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.48 } } }}
                    >
                        {[
                            [ClipboardCheck, 'Intentional planning', 'Build every evaluation with clarity, consistency, and purpose.'],
                            [BarChart3, 'Decisive insight', 'Turn assessment data into the next right decision for your academy.'],
                            [ShieldCheck, 'Trusted control', 'Keep the operational details of learning precise and dependable.'],
                        ].map(([Icon, title, description]) => (
                            <motion.div
                                key={title}
                                className="landing-principle"
                                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                                transition={{ duration: 0.55 }}
                            >
                                <Icon size={20} strokeWidth={1.5} />
                                <div>
                                    <h2>{title}</h2>
                                    <p>{description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminLanding;