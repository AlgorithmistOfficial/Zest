import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Copy, CheckCircle2, Terminal, Sun, Moon, LogOut, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Helmet } from 'react-helmet-async';

const Practice = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [code, setCode] = useState(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Zest!");
    }
}`);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');
    const [editorTheme, setEditorTheme] = useState('vs'); // 'vs' or 'vs-dark'
    const socketRef = useRef(null);
    const outputRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Initialize WebSocket
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
        socketRef.current = io(backendUrl);

        socketRef.current.on('output', (data) => {
            setOutput((prev) => prev + data);
            // Auto scroll to bottom
            if (outputRef.current) {
                outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
        });

        socketRef.current.on('exit', (code) => {
            setOutput((prev) => prev + `\n[Program exited with code ${code}]\n`);
            setIsLoading(false);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/auth');
    };

    const handleRunCode = () => {
        if (!socketRef.current) return;
        setIsLoading(true);
        setOutput('');
        socketRef.current.emit('run-code', { code });
    };

    const handleSendInput = (e) => {
        if (e.key === 'Enter') {
            const data = inputBuffer + '\n';
            socketRef.current.emit('input', data);
            setOutput((prev) => prev + data); // Local echo
            setInputBuffer('');
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
        <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col overflow-x-hidden">
            <Helmet>
                <title>Zest - Practice</title>
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

            <main className="pt-24 h-screen flex flex-col px-4 pb-4">
                <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">

                    {/* Editor Section */}
                    <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Editor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setEditorTheme(prev => prev === 'vs' ? 'vs-dark' : 'vs')}
                                    className="p-2 text-slate-400 hover:text-navy transition-colors rounded-lg hover:bg-slate-100 flex items-center gap-2 text-xs font-bold"
                                    title="Toggle Editor Theme"
                                >
                                    {editorTheme === 'vs' ? <Moon size={18} /> : <Sun size={18} />}
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-slate-400 hover:text-navy transition-colors rounded-lg hover:bg-slate-100"
                                    title="Copy Code"
                                >
                                    {copySuccess ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                                <button
                                    onClick={() => {
                                        const classMatch = code.match(/public\s+class\s+([a-zA-Z0-9_$]+)/) || code.match(/class\s+([a-zA-Z0-9_$]+)/);
                                        const fileName = (classMatch ? classMatch[1] : 'Main') + '.java';
                                        const blob = new Blob([code], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="p-2 text-slate-400 hover:text-navy transition-colors rounded-lg hover:bg-slate-100"
                                    title="Download as .java"
                                >
                                    <Download size={18} />
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
                        <div className="flex-1 min-h-[400px]">
                            <Editor
                                height="100%"
                                language="java"
                                value={code}
                                theme={editorTheme}
                                onChange={(value) => setCode(value)}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 20 },
                                    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
                                }}
                            />
                        </div>
                    </div>

                    {/* Terminal Section */}
                    <div className="lg:w-1/3 flex flex-col gap-4">
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

                        {/* Interactive Terminal Area */}
                        <div className="flex-1 bg-navy rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                            <div className="px-6 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal size={14} className="text-white/40" />
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Ouput Terminal</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                </div>
                            </div>

                            {/* Terminal Output */}
                            <div
                                ref={outputRef}
                                className="flex-1 p-6 font-mono text-sm text-lime/90 overflow-auto whitespace-pre-wrap leading-relaxed"
                            >
                                {output || '// Program output will appear here...'}
                            </div>

                            {/* Terminal Input */}
                            <div className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-3">
                                <span className="text-lime font-bold text-sm select-none">&gt;</span>
                                <input
                                    type="text"
                                    value={inputBuffer}
                                    onChange={(e) => setInputBuffer(e.target.value)}
                                    onKeyDown={handleSendInput}
                                    placeholder={isLoading ? "Type input and press Enter..." : "Run code to start interacting"}
                                    disabled={!isLoading}
                                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-white/20"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Practice;
