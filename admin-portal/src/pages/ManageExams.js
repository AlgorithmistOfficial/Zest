import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, Clock, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PageHeader from '../components/PageHeader';

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchExams(); }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data);
        } catch (err) {
            setError('Failed to load exams.');
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await api.delete(`/exams/${id}`);
            setExams(exams.filter(e => e._id !== id));
            setSuccess('Exam deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch { setError('Failed to delete exam.'); }
    };

    const fmt = (num, len) => num.toString().padStart(len, '0');
    const fmtDate = (n) => { const s = fmt(n,8); return `${s.slice(0,2)}-${s.slice(2,4)}-${s.slice(4)}`; };
    const fmtTime = (n) => { const s = fmt(n,6); return `${s.slice(0,2)}:${s.slice(2,4)}`; };

    const diffColor = { hard: 'bg-red-500', medium: 'bg-amber-500', easy: 'bg-green-500' };
    const statusColor = { scheduled: 'bg-blue-100 text-blue-700', ongoing: 'bg-amber-100 text-amber-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

    if (loading) return <div className="text-center py-24 text-slate-400 font-bold text-lg">Loading exams…</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-16">
            <PageHeader title="Manage Your Exams" description="Overview and manage all scheduled evaluations for the Algorithmist DSA platform." />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-100 mb-6">
                    <AlertCircle size={18} /> {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold flex items-center gap-2 border border-green-100 mb-6">
                    <CheckCircle2 size={18} /> {success}
                </div>
            )}

            {exams.length === 0 ? (
                <div className="card text-center py-20">
                    <p className="text-slate-400 font-medium text-lg mb-6">No exams scheduled yet.</p>
                    <button onClick={() => navigate('/create')} className="btn btn-primary text-base px-8 py-3">
                        Schedule Your First Exam
                    </button>
                </div>
            ) : (
                <div className="grid gap-5">
                    {exams.map((exam, idx) => (
                        <motion.div
                            key={exam._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="card group flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-extrabold text-navy truncate">{exam.examName}</h3>
                                    <span className={`${diffColor[exam.difficultyLevel]} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full`}>
                                        {exam.difficultyLevel}
                                    </span>
                                    <span className={`${statusColor[exam.status]} text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full`}>
                                        {exam.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-slate-500">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-lime" /> {fmtDate(exam.examDate)}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-lime" /> {fmtTime(exam.examTime)}</span>
                                    <span className="flex items-center gap-1.5"><Award size={14} className="text-lime" /> {exam.totalMarks} marks · {exam.duration}m</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {exam.topics.map((t, i) => (
                                        <span key={i} className="bg-lime/10 text-navy text-xs font-bold px-2.5 py-1 rounded-lg">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                                <button onClick={() => navigate(`/edit/${exam._id}`)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-lime/20 flex items-center justify-center text-navy transition-colors" title="Edit">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(exam._id)} className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ManageExams;
