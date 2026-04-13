import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PageHeader from '../components/PageHeader';

const ScheduleExam = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        testId: '', examName: '', examDate: '', examTime: '', duration: '',
        difficultyLevel: 'medium', totalMarks: '', passingMarks: '',
        topics: '', status: 'scheduled'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const [y, m, d] = formData.examDate.split('-');
        const [hh, mm] = formData.examTime.split(':');

        const payload = {
            ...formData,
            examDate: parseInt(`${d}${m}${y}`),
            examTime: parseInt(`${hh}${mm}00`),
            duration: parseInt(formData.duration),
            totalMarks: parseInt(formData.totalMarks),
            passingMarks: parseInt(formData.passingMarks),
            topics: formData.topics.split(',').map(s => s.trim())
        };

        try {
            await api.post('/exams', payload);
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch { alert('Failed to schedule exam'); }
        finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-16">
            <PageHeader title="Schedule New Exam" description="Configure and launch a new DSA evaluation for your students." />

            <div className="card max-w-2xl mx-auto">
                {success ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-green-600 mb-1">Exam Scheduled!</h2>
                        <p className="text-slate-500">Redirecting to dashboard…</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid-2">
                        <div className="span-2 md:col-span-1">
                            <label className="label">Test ID</label>
                            <input type="text" id="testId" className="input-field" placeholder="e.g., TEST-001" required onChange={handleChange} />
                        </div>
                        <div className="span-2 md:col-span-1">
                            <label className="label">Exam Name</label>
                            <input type="text" id="examName" className="input-field" placeholder="e.g., Arrays & Linked Lists" required onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Exam Date</label>
                            <input type="date" id="examDate" className="input-field" required onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Start Time</label>
                            <input type="time" id="examTime" className="input-field" required onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Duration (Minutes)</label>
                            <input type="number" id="duration" className="input-field" placeholder="60" required min="1" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Difficulty</label>
                            <select id="difficultyLevel" className="input-field" onChange={handleChange} value={formData.difficultyLevel}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Total Marks</label>
                            <input type="number" id="totalMarks" className="input-field" placeholder="100" required min="1" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Passing Marks</label>
                            <input type="number" id="passingMarks" className="input-field" placeholder="40" required min="1" onChange={handleChange} />
                        </div>
                        <div className="span-2">
                            <label className="label">Topics (Comma separated)</label>
                            <input type="text" id="topics" className="input-field" placeholder="Arrays, Pointers, Sorting" required onChange={handleChange} />
                        </div>

                        <div className="span-2 pt-2">
                            <button type="submit" disabled={loading}
                                className="btn btn-primary w-full py-4 text-base font-bold rounded-2xl">
                                {loading ? 'Scheduling…' : 'Schedule Exam'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </motion.div>
    );
};

export default ScheduleExam;
