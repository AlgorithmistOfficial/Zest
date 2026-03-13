import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Copy, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Practice = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Zest!");
    }
}`);
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('Compiling and running...');

    try {
      const response = await fetch('https://Shreyansh6726-zest.hf.space/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, input })
      });

      const data = await response.text();
      setOutput(data || 'No output received.');
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Zest!");
    }
}`);
    setOutput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20 ${isScrolled
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

      <main className="pt-24 h-screen flex flex-col px-4 pb-4">
        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">

          {/* Editor Section */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Main.java</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-navy transition-colors rounded-lg hover:bg-slate-100"
                  title="Copy Code"
                >
                  {copySuccess ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-navy transition-colors rounded-lg hover:bg-slate-100"
                  title="Reset Code"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-6 font-mono text-sm resize-none focus:outline-none bg-slate-50/10 text-slate-800 leading-relaxed"
              spellCheck="false"
            />
          </div>

          {/* Action Bar & Output Section */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            {/* Input Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-1/3 min-h-[150px]">
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Standard Input</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program here..."
                className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-slate-50/10 text-slate-800 leading-relaxed"
                spellCheck="false"
              />
            </div>

            {/* Run Button Container */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunCode}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-all shadow-lg ${isLoading ? 'bg-slate-400' : 'bg-navy shadow-navy/20 hover:bg-navy/90'
                  }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
                {isLoading ? 'Running...' : 'Run Code'}
              </motion.button>
            </div>

            {/* Output Area */}
            <div className="flex-1 bg-navy rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Output</span>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                </div>
              </div>
              <div className="flex-1 p-6 font-mono text-sm text-lime/90 overflow-auto whitespace-pre-wrap leading-relaxed">
                {output || '// Program output will appear here...'}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Practice;
