import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = 'https://Shreyansh6726-zest.hf.space'; // Base URL for backend

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => window.location.href = '/', 2000);
      } else {
        setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
        setIsLogin(true);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

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

      <main className="pt-32 pb-20 px-4 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-navy/5 overflow-hidden"
          >
            {/* Toggle Header */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                  isLogin ? 'bg-navy text-white shadow-lg' : 'text-slate-400 hover:text-navy'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                  !isLogin ? 'bg-navy text-white shadow-lg' : 'text-slate-400 hover:text-navy'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-navy mb-2">
                  {isLogin ? 'Welcome Back' : 'Join Zest'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {isLogin ? 'Enter your credentials to continue' : 'Create an account to track your DSA progress'}
                </p>
              </div>

              {message.text && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white">!</div>}
                  {message.text}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="signup-name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          name="name"
                          required={!isLogin}
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all font-medium"
                          placeholder="Shreyansh Srivastava"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email ID</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      required
                      pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all font-medium"
                      placeholder="you@gmail.com"
                    />
                  </div>
                  {!isLogin && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-1">
                      <CheckCircle2 size={10} className="text-lime" />
                      Must be a valid Gmail address
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 group mt-4 transition-all ${
                    loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-navy text-white shadow-navy/20'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isLogin ? 'Login' : 'Create Account'}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          <p className="text-center mt-8 text-slate-500 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-navy font-bold hover:text-lime transition-colors underline decoration-lime/30 underline-offset-4"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </main>

      <footer className="py-12 bg-navy text-white text-center px-4 mt-auto border-t border-white/5">
        <p className="font-medium leading-relaxed opacity-80">
          <span className="block md:inline">&copy; {new Date().getFullYear()} <span className="font-bold text-white">Shreyansh Srivastava</span></span>
          <span className="hidden md:inline"> . </span>
          <span className="block md:inline uppercase tracking-wider text-[10px] md:text-sm md:normal-case font-bold md:font-medium">For Algorithmist DSA Classes</span>
        </p>
      </footer>
    </div>
  );
};

export default Auth;
