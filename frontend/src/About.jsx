import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${
        isScrolled 
          ? 'bg-[#92c211] md:bg-[#92c211]/60 py-1' 
          : 'bg-[#92c211] md:bg-[#92c211]/90 py-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <ArrowLeft size={20} />
              <span className="font-bold">Back to Zest</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold text-xl tracking-tight">Zest</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Our Journey</h1>
            <div className="w-24 h-1.5 bg-lime mx-auto rounded-full"></div>
          </motion.div>

          {/* Story Content */}
          <div className="space-y-12 text-lg text-slate-700 leading-relaxed">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-8 border-l-4 border-lime/30"
            >
              <h2 className="text-2xl font-bold text-navy mb-4">Humble Beginnings</h2>
              <p>
                Algorithmist started as a typical, small-scale tuition center with a handful of dedicated students and a single white board. Our mission was simple yet profound: to bridge the gap between classroom theory and the complex world of Data Structures and Algorithms. We focused on the fundamentals, teaching students how to think logically and solve problems from scratch.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pr-8 text-right border-r-4 border-navy/30"
            >
              <h2 className="text-2xl font-bold text-navy mb-4">The Digital Leap</h2>
              <p>
                As our community grew, so did our vision. We realized that to truly empower every student, we needed to evolve. We transitioned from a local tuition center to a comprehensive online platform. Zest was born out of this necessity—a place where students can evaluate themselves, track their progress in real-time, and master DSA concepts through rigorous testing and feedback.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-navy/5 p-8 rounded-3xl border border-navy/10"
            >
              <h2 className="text-2xl font-bold text-navy mb-4 text-center">A Note of Thanks</h2>
              <p className="text-center italic">
                "We wouldn't be here without the unwavering support of our students and their parents. Your trust in our methods and your dedication to learning have been the driving force behind every upgrade we've made. Thank you for being a part of the Algorithmist family and for supporting us in our mission to make elite DSA education accessible to all."
              </p>
              <div className="flex justify-center mt-6 text-lime">
                <Heart fill="currentColor" size={24} />
              </div>
            </motion.section>
          </div>

          {/* Founder Spotlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-lime rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white shadow-2xl overflow-hidden mx-auto mb-8 bg-slate-100">
                <img
                  src="/head.png"
                  alt="Founder of Algorithmist"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=Algorithmist+Founder&background=92c211&color=fff&size=256";
                  }}
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy">Shreyansh Srivastava</h3>
            <p className="text-slate-500 font-medium">Founder of Algorithmist DSA Classes</p>
          </motion.div>

          {/* Contact & Social Section */}
          <section className="mt-32 pt-20 border-t border-slate-200">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-navy">Get In Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center text-navy font-bold">
                      <Mail size={20} />
                    </div>
                    <span>shreyansh.official.6726@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center text-navy font-bold">
                      <MapPin size={20} />
                    </div>
                    <span>Gurgaon, Haryana</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-navy">Follow Our Updates</h2>
                <div className="flex gap-4">
                  <a href="https://www.linkedin.com/in/shreyansh-srivastava-b4b1a6257/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center hover:bg-lime hover:text-navy transition-all duration-300 shadow-lg">
                    <Linkedin size={24} />
                  </a>
                  <a href="https://x.com/Shreyansh6726" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center hover:bg-lime hover:text-navy transition-all duration-300 shadow-lg">
                    <Twitter size={24} />
                  </a>
                  <a href="https://github.com/shreyansh6726" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center hover:bg-lime hover:text-navy transition-all duration-300 shadow-lg">
                    <Github size={24} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-12 bg-navy text-white text-center mt-20">
        <p className="font-medium opacity-80">
          &copy; {new Date().getFullYear()} <span className="font-bold">Shreyansh Srivastava</span>. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default About;
