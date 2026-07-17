import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, ArrowRight, CheckCircle2, X, AlertCircle, KeyRound, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { setAuthSession } from './authStorage';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [step, setStep] = useState('info'); // 'info' or 'otp'
  const [loading, setLoading] = useState(false);
  const [persistent, setPersistent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [forgotModal, setForgotModal] = useState({
    isOpen: false,
    step: 0,
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: ''
  });

  const resetForgotModal = () => {
    setForgotModal({ isOpen: false, step: 0, email: '', otp: '', newPassword: '', confirmPassword: '', loading: false, error: '' });
  };

  const API_URL = process.env.REACT_APP_BACKEND_URL ; // Base URL for backend

  const passwordRules = {
    length: formData.password.length >= 8 && formData.password.length <= 25,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.password !== ''
  };
  const isPasswordOptional = !formData.password && !formData.confirmPassword;

  const forgotPasswordRules = {
    length: forgotModal.newPassword.length >= 8 && forgotModal.newPassword.length <= 25,
    hasLetter: /[a-zA-Z]/.test(forgotModal.newPassword),
    hasNumber: /[0-9]/.test(forgotModal.newPassword),
    match: forgotModal.newPassword === forgotModal.confirmPassword && forgotModal.newPassword !== ''
  };

  const isPasswordValid = passwordRules.length && passwordRules.hasLetter && passwordRules.hasNumber;
  const isForgotPassValid = forgotPasswordRules.length && forgotPasswordRules.hasLetter && forgotPasswordRules.hasNumber;

  const canSubmit = isLogin ? (formData.email && formData.password) : (
    step === 'info' ? (formData.name && formData.email && (isPasswordOptional || (isPasswordValid && passwordRules.match))) : formData.otp
  );

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
    if (!canSubmit) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    const endpoint = isLogin ? '/api/auth/login' : (step === 'info' ? '/api/auth/send-otp' : '/api/auth/signup');

    try {
      if (!isLogin && step === 'info') {
        const response = await fetch(`${API_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setMessage({ type: 'success', text: 'OTP sent to your email!' });
        setStep('otp');
        return;
      }

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
        setAuthSession(data.token, data.user, persistent);
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => window.location.href = '/home', 2000);
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

  const handleGoogleLogin = () => {
    window.location.assign(`${API_URL}/api/auth/google?remember=${persistent}&returnTo=${encodeURIComponent(window.location.origin)}`);
  };

  const handleForgotSendOtp = async () => {
    if (!forgotModal.email.match(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)) {
      return setForgotModal(prev => ({ ...prev, error: 'Enter a valid Gmail address' }));
    }
    setForgotModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotModal.email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setForgotModal(prev => ({ ...prev, step: 1, loading: false }));
    } catch (err) {
      setForgotModal(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const handleForgotVerifyOtp = async () => {
    setForgotModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotModal.email, otp: forgotModal.otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setForgotModal(prev => ({ ...prev, step: 2, loading: false }));
    } catch (err) {
      setForgotModal(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const handleForgotLoginWithOtp = async () => {
    setForgotModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await fetch(`${API_URL}/api/auth/login-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotModal.email, otp: forgotModal.otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setAuthSession(data.token, data.user, persistent);
      
      setForgotModal(prev => ({ ...prev, step: 4, loading: false }));
      setTimeout(() => window.location.href = '/home', 1500);
    } catch (err) {
      setForgotModal(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const handleForgotChangePassword = async () => {
    if (!forgotPasswordRules.match) {
      return setForgotModal(prev => ({ ...prev, error: 'Passwords do not match' }));
    }
    if (!isForgotPassValid) {
      return setForgotModal(prev => ({ ...prev, error: 'Password does not meet the requirements' }));
    }
    setForgotModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotModal.email, otp: forgotModal.otp, newPassword: forgotModal.newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setAuthSession(data.token, data.user, persistent);
      
      setForgotModal(prev => ({ ...prev, step: 4, loading: false }));
      setTimeout(() => window.location.href = '/home', 1500);
    } catch (err) {
      setForgotModal(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };


  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col">
      <Helmet>
        <title>Zest - Sign In / Sign Up</title>
      </Helmet>

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
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${isLogin ? 'bg-navy text-white shadow-lg' : 'text-slate-400 hover:text-navy'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${!isLogin ? 'bg-navy text-white shadow-lg' : 'text-slate-400 hover:text-navy'
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
                  className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === 'success'
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
                  {!isLogin && step === 'otp' && (
                    <motion.div
                      key="signup-otp"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div className="bg-lime/5 p-4 rounded-2xl border border-lime/10 mb-2">
                        <p className="text-xs text-navy font-medium text-center italic">
                          We've sent a 6-digit verification code to <span className="font-bold">{formData.email}</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Verification OTP</label>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            name="otp"
                            required
                            maxLength="6"
                            value={formData.otp}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all font-bold tracking-[0.5em] text-center text-xl"
                            placeholder="000000"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('info')}
                        className="text-xs text-navy font-bold hover:text-lime transition-colors ml-1"
                      >
                        ← Edit Email
                      </button>
                    </motion.div>
                  )}

                  {!isLogin && step === 'info' && (
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
                      pattern="[a-zA-Z0-9._%\-\+]+@gmail\.com"
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

                  {step === 'info' && (
                    <div className="space-y-4">
                      {/* Password Field */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password <span className="normal-case font-semibold">(optional)</span></label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="password"
                            name="password"
                            required={false}
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium ${
                              formData.password && !isLogin
                                ? isPasswordValid ? 'border-green-100 focus:border-green-400' : 'border-red-50 focus:border-red-200'
                                : 'border-transparent focus:border-lime focus:bg-white'
                            }`}
                            placeholder="••••••••"
                          />
                        </div>

                        {/* Password Rules Indicators (only for signup and when password is provided) */}
                        {!isLogin && formData.password && (
                          <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordRules.length ? 'text-green-600' : 'text-slate-400'}`}>
                              <CheckCircle2 size={10} className={passwordRules.length ? 'text-green-600' : 'text-slate-300'} />
                              8-25 characters
                            </div>
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordRules.hasLetter ? 'text-green-600' : 'text-slate-400'}`}>
                              <CheckCircle2 size={10} className={passwordRules.hasLetter ? 'text-green-600' : 'text-slate-300'} />
                              One letter
                            </div>
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordRules.hasNumber ? 'text-green-600' : 'text-slate-400'}`}>
                              <CheckCircle2 size={10} className={passwordRules.hasNumber ? 'text-green-600' : 'text-slate-300'} />
                              One number
                            </div>
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${passwordRules.match ? 'text-green-600' : 'text-slate-400'}`}>
                              <CheckCircle2 size={10} className={passwordRules.match ? 'text-green-600' : 'text-slate-300'} />
                              Passwords match
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Field (only for signup) */}
                      {!isLogin && (
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password <span className="normal-case font-semibold">(optional)</span></label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="password"
                              name="confirmPassword"
                              required={false}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium ${
                                formData.confirmPassword 
                                  ? passwordRules.match ? 'border-green-100 focus:border-green-400' : 'border-red-50 focus:border-red-200'
                                  : 'border-transparent focus:border-lime focus:bg-white'
                              }`}
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-2">
                       <input
                        type="checkbox"
                        id="persistent"
                        checked={persistent}
                        onChange={(e) => setPersistent(e.target.checked)}
                        className="w-4 h-4 accent-lime rounded cursor-pointer"
                      />
                      <label htmlFor="persistent" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                        Remember Me
                      </label>
                    </div>
                    {isLogin && (
                      <button type="button" onClick={() => setForgotModal({...forgotModal, isOpen: true})} className="text-xs font-bold text-navy hover:text-lime transition-colors underline decoration-lime/30 underline-offset-2">
                          Forgot Password?
                      </button>
                    )}
                  </div>

                <motion.button
                  whileHover={canSubmit && !loading ? { scale: 1.02 } : {}}
                  whileTap={canSubmit && !loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={`w-full py-4 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 group mt-4 transition-all ${
                    !canSubmit || loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-navy text-white shadow-navy/20'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isLogin ? 'Login' : (step === 'info' ? 'Next: Verify Email' : 'Complete Registration')}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                    <span className="bg-white px-4 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-4 bg-white border-2 border-slate-100 hover:border-lime/30 hover:bg-slate-50 text-navy font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      style={{ color: '#4285F4' }}
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      style={{ color: '#34A853' }}
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      style={{ color: '#FBBC05' }}
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      style={{ color: '#EA4335' }}
                    />
                  </svg>
                  Continue with Google
                </motion.button>
              </div>
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

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
              onClick={forgotModal.loading || forgotModal.step === 4 ? null : resetForgotModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-navy">
                    {forgotModal.step === 0 && "Reset Password"}
                    {forgotModal.step === 1 && "Security Verification"}
                    {forgotModal.step === 2 && "Verification Successful"}
                    {forgotModal.step === 3 && "Create New Password"}
                    {forgotModal.step === 4 && "Success!"}
                </h3>
                {forgotModal.step !== 4 && (
                    <button onClick={resetForgotModal} className="p-2 bg-slate-50 text-slate-400 hover:text-navy rounded-full transition-colors"><X size={16}/></button>
                )}
              </div>

              {forgotModal.error && (
                <p className="text-red-500 flex items-center gap-1 text-xs font-bold mb-4 bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={14}/> {forgotModal.error}
                </p>
              )}

              {forgotModal.step === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Enter your registered email address and we'll send you a 6-digit OTP to verify your identity.</p>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email"
                      value={forgotModal.email}
                      onChange={(e) => setForgotModal({...forgotModal, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all font-bold"
                      placeholder="Your Gmail Address"
                    />
                  </div>
                  <button 
                    onClick={handleForgotSendOtp}
                    disabled={!forgotModal.email || forgotModal.loading}
                    className="w-full py-4 bg-navy text-white font-bold rounded-xl shadow-lg shadow-navy/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center h-14"
                  >
                    {forgotModal.loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Send Recovery Code"}
                  </button>
                </div>
              )}

              {forgotModal.step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    We've sent a 6-digit code to <strong className="text-navy">{forgotModal.email}</strong>
                  </p>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={forgotModal.otp}
                    onChange={(e) => setForgotModal({...forgotModal, otp: e.target.value.replace(/\D/g, '')})}
                    className="w-full text-center text-3xl tracking-[0.5em] font-black py-4 bg-slate-50 border-2 border-transparent focus:border-lime focus:bg-white rounded-2xl outline-none transition-all text-navy placeholder:text-slate-300"
                    placeholder="••••••"
                  />
                  <button 
                    onClick={handleForgotVerifyOtp}
                    disabled={forgotModal.otp.length !== 6 || forgotModal.loading}
                    className="w-full py-4 bg-navy text-white font-bold rounded-xl shadow-lg shadow-navy/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center h-14"
                  >
                    {forgotModal.loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Verify Code"}
                  </button>
                </div>
              )}

              {forgotModal.step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-2">Your identity has been verified. How would you like to proceed?</p>
                  
                  <button 
                    onClick={handleForgotLoginWithOtp}
                    disabled={forgotModal.loading}
                    className="w-full flex items-center justify-between p-4 bg-lime/10 hover:bg-lime/20 border border-lime/20 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-lime rounded-lg shadow-sm"><LogIn size={18} /></div>
                      <div className="text-left">
                        <span className="block font-bold text-navy text-sm">Login for now</span>
                        <span className="block text-xs text-slate-500">Go directly to your dashboard</span>
                      </div>
                    </div>
                    {forgotModal.loading ? <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin"></div> : <ArrowRight size={16} className="text-lime group-hover:translate-x-1 transition-all" />}
                  </button>

                  <button 
                    onClick={() => setForgotModal(prev => ({ ...prev, step: 3 }))}
                    disabled={forgotModal.loading}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-navy rounded-lg shadow-sm"><KeyRound size={18} /></div>
                      <div className="text-left">
                        <span className="block font-bold text-navy text-sm">Change password</span>
                        <span className="block text-xs text-slate-500">Set a new password and proceed</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              )}

              {forgotModal.step === 3 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password"
                      value={forgotModal.newPassword}
                      onChange={(e) => setForgotModal({...forgotModal, newPassword: e.target.value})}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold ${
                        forgotModal.newPassword 
                          ? isForgotPassValid ? 'border-green-100 focus:border-green-400' : 'border-red-50 focus:border-red-200'
                          : 'border-transparent focus:border-lime focus:bg-white'
                      }`}
                      placeholder="New Password"
                    />
                  </div>
                  
                  {/* Password Rules Indicators */}
                  <div className="grid grid-cols-2 gap-2 px-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${forgotPasswordRules.length ? 'text-green-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={10} className={forgotPasswordRules.length ? 'text-green-600' : 'text-slate-300'} />
                      8-25 characters
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${forgotPasswordRules.hasLetter ? 'text-green-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={10} className={forgotPasswordRules.hasLetter ? 'text-green-600' : 'text-slate-300'} />
                      One letter
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${forgotPasswordRules.hasNumber ? 'text-green-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={10} className={forgotPasswordRules.hasNumber ? 'text-green-600' : 'text-slate-300'} />
                      One number
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${forgotPasswordRules.match ? 'text-green-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={10} className={forgotPasswordRules.match ? 'text-green-600' : 'text-slate-300'} />
                      Passwords match
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50" size={18} />
                    <input 
                      type="password"
                      value={forgotModal.confirmPassword}
                      onChange={(e) => setForgotModal({...forgotModal, confirmPassword: e.target.value})}
                      className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold ${
                        forgotModal.confirmPassword 
                          ? forgotPasswordRules.match ? 'border-green-100 focus:border-green-400' : 'border-red-50 focus:border-red-200'
                          : 'border-transparent focus:border-lime focus:bg-white'
                      }`}
                      placeholder="Confirm New Password"
                    />
                  </div>
                  <button 
                    onClick={handleForgotChangePassword}
                    disabled={!isForgotPassValid || !forgotPasswordRules.match || forgotModal.loading}
                    className="w-full py-4 mt-2 bg-lime text-navy font-bold rounded-xl shadow-lg shadow-lime/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center h-14"
                  >
                    {forgotModal.loading ? <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin"></div> : "Save & Continue"}
                  </button>
                </div>
              )}

              {forgotModal.step === 4 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-slate-500 text-sm">Redirecting to Dashboard...</p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
