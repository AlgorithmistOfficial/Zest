import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Info, 
  ShieldCheck, 
  PlayCircle 
} from 'lucide-react';

const Test = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [testData, setTestData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';
                const res = await fetch(`${backendUrl}/api/test-contents/${testId}`);
                if (!res.ok) throw new Error('Test not found');
                const data = await res.json();
                setTestData(data);
            } catch (err) {
                console.error('Error loading test:', err);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };
        fetchTestDetails();
    }, [testId, navigate]);

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit the test? Progressive will be lost.')) {
            navigate('/home');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fffef2] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-lime border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffef2] text-navy selection:bg-lime/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy/5 rounded-full blur-[100px] -ml-64 -mb-64"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-2xl w-full bg-white/70 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white shadow-2xl relative z-10"
            >
                {/* Header Profile Check */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-lime/10 rounded-3xl flex items-center justify-center text-lime">
                        <ShieldCheck size={48} />
                    </div>
                </div>

                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Welcome to <span className="text-lime">{testData?.examName || 'the Test'}</span>
                    </h1>
                    <p className="text-slate-600 font-medium">
                        You have successfully entered the secure test environment.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-xl font-bold">{testData?.duration} Minutes</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Marks</p>
                        <p className="text-xl font-bold">{testData?.totalMarks} Marks</p>
                    </div>
                </div>

                {/* Secure Protocol Notice */}
                <div className="bg-navy/5 border border-navy/10 p-6 rounded-3xl mb-10 flex gap-4 items-start">
                    <Info className="text-navy shrink-0 mt-1" size={20} />
                    <div className="text-sm">
                        <p className="font-bold text-navy mb-1">Security Protocols Active</p>
                        <p className="text-slate-600 leading-relaxed">
                            This is a secure browser window. Tab switching and exiting fullscreen mode are monitored.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => alert("Question logic coming in the next phase!")}
                        className="flex-1 py-4 bg-lime text-white rounded-2xl font-extrabold shadow-lg shadow-lime/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <PlayCircle size={20} /> Start Solving
                    </button>
                    <button 
                        onClick={handleExit}
                        className="flex-1 py-4 bg-white text-navy border-2 border-slate-200 rounded-2xl font-extrabold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={20} /> Exit Test
                    </button>
                </div>
            </motion.div>

            {/* Bottom Brand */}
            <div className="mt-8 flex items-center gap-2 opacity-30 grayscale pointer-events-none">
                <img src="/logo.png" alt="Zest" className="w-5 h-5" />
                <span className="font-black tracking-tighter text-navy uppercase text-xs">Secure environment powered by Zest</span>
            </div>
        </div>
    );
};

export default Test;
