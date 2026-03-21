import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import api from '../api';

const ActiveStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchActiveStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            // In a real scenario, this would fetch from the backend.
            // Since we don't have the backend, we search for students who have been active recently.
            // For now, we'll implement the fetching logic and handle the case where it fails.
            const response = await api.get('/admin/active-students');
            setStudents(response.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching active students:', err);
            setError('Could not connect to the backend server. Displaying demo data instead.');
            
            // MOCK DATA for demonstration purposes
            setStudents([
                { id: 1, name: 'Alex Rivera', email: 'alex@gmail.com', lastActive: '2 minutes ago' },
                { id: 2, name: 'Samantha Lee', email: 'sam@gmail.com', lastActive: 'Just now' },
                { id: 3, name: 'Jordan Smith', email: 'jordan@gmail.com', lastActive: '5 minutes ago' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveStudents();
        const interval = setInterval(fetchActiveStudents, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader 
                    title="Active Students" 
                    subtitle="Monitor students currently signed in to the portal."
                    icon={Users}
                />
                
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button 
                        onClick={fetchActiveStudents}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-navy hover:border-navy transition-all shadow-sm"
                        title="Refresh now"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-900 mb-1">Connection Issue</h3>
                        <p className="text-red-700 font-medium">
                            {error} 
                            <span className="block mt-2 text-sm opacity-80">
                                Note: The backend source code for this feature needs to be implemented.
                            </span>
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-navy/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Email Address</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && students.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-navy/10 border-t-navy rounded-full animate-spin"></div>
                                            <span className="font-bold text-slate-400">Scanning for active students...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <Users size={48} className="opacity-20" />
                                            <span className="text-xl font-bold">No students currently online</span>
                                            <p className="text-sm font-medium text-slate-400 max-w-xs">
                                                When students log in to the portal, they will appear here in real-time.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={student.id || idx} 
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-lime text-white flex items-center justify-center font-black text-lg shadow-lg">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-navy group-hover:text-black transition-colors">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium lowercase">
                                                <Mail size={14} className="opacity-40" />
                                                {student.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm border border-green-100 shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                Online
                                            </div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1 mr-1">
                                                Active {student.lastActive || 'now'}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-navy p-8 rounded-[2.5rem] text-white shadow-xl shadow-navy/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Users size={80} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-2">Unique Visitors</h4>
                    <p className="text-4xl font-black mb-1">--</p>
                    <p className="text-sm font-medium text-white/60">Total students today</p>
                </div>
                
                <div className="bg-lime p-8 rounded-[2.5rem] text-white shadow-xl shadow-lime/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Clock size={80} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-2">Avg Session</h4>
                    <p className="text-4xl font-black mb-1">--</p>
                    <p className="text-sm font-medium text-white/60">Duration per student</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-navy/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500 text-navy">
                        <AlertCircle size={80} />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Pending Logins</h4>
                    <p className="text-4xl font-black mb-1 text-navy">--</p>
                    <p className="text-sm font-medium text-slate-500">Attempts in last hour</p>
                </div>
            </div>
        </div>
    );
};

export default ActiveStudents;
