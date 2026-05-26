import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api';
import PageHeader from '../components/PageHeader';

const EditExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        testId: '', examName: '', examDate: '', examTime: '', duration: '',
        difficultyLevel: '', totalMarks: '', passingMarks: '',
        topics: '', status: ''
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchExam(); }, [id]);

    const fetchExam = async () => {
        try {
            const res = await api.get('/exams');
            const exam = res.data.find(e => e._id === id);
            if (!exam) throw new Error('Not found');

            const sd = exam.examDate.toString().padStart(8, '0');
            const st = exam.examTime.toString().padStart(6, '0');

            setFormData({
                testId: exam.testId || '',
                examName: exam.examName,
                examDate: `${sd.slice(4)}-${sd.slice(2,4)}-${sd.slice(0,2)}`,
                examTime: `${st.slice(0,2)}:${st.slice(2,4)}`,
                duration: exam.duration,
                difficultyLevel: exam.difficultyLevel,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                topics: exam.topics.join(', '),
                status: exam.status
            });
        } catch { alert('Failed to load exam data.'); navigate('/'); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

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
            await api.put(`/exams/${id}`, payload);
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch { alert('Failed to update exam'); }
        finally { setSaving(false); }
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>ABCD - Edit Exam</title>
                </Helmet>
                <div className="text-center py-24 text-slate-400 font-bold text-lg">Loading exam data…</div>
            </>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-16">
            <Helmet>
                <title>ABCD - Edit Exam</title>
            </Helmet>

            <PageHeader title="Edit Exam" description={`Modify the details for: ${formData.examName}`} />

            <div className="card max-w-2xl mx-auto">
                {success ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-green-600 mb-1">Exam Updated!</h2>
                        <p className="text-slate-500">Redirecting to dashboard…</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid-2">
                        <div className="span-2 md:col-span-1">
                            <label className="label">Test ID</label>
                            <input type="text" id="testId" className="input-field" required onChange={handleChange} value={formData.testId} />
                        </div>
                        <div className="span-2 md:col-span-1">
                            <label className="label">Exam Name</label>
                            <input type="text" id="examName" className="input-field" required onChange={handleChange} value={formData.examName} />
                        </div>
                        <div>
                            <label className="label">Exam Date</label>
                            <input type="date" id="examDate" className="input-field" required onChange={handleChange} value={formData.examDate} />
                        </div>
                        <div>
                            <label className="label">Start Time</label>
                            <input type="time" id="examTime" className="input-field" required onChange={handleChange} value={formData.examTime} />
                        </div>
                        <div>
                            <label className="label">Duration (Minutes)</label>
                            <input type="number" id="duration" className="input-field" required min="1" onChange={handleChange} value={formData.duration} />
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
                            <input type="number" id="totalMarks" className="input-field" required min="1" onChange={handleChange} value={formData.totalMarks} />
                        </div>
                        <div>
                            <label className="label">Passing Marks</label>
                            <input type="number" id="passingMarks" className="input-field" required min="1" onChange={handleChange} value={formData.passingMarks} />
                        </div>
                        <div className="span-2">
                            <label className="label">Topics (Comma separated)</label>
                            <input type="text" id="topics" className="input-field" required onChange={handleChange} value={formData.topics} />
                        </div>

                        <div className="span-2 pt-2">
                            <button type="submit" disabled={saving}
                                className="btn btn-primary w-full py-4 text-base font-bold rounded-2xl">
                                {saving ? 'Saving…' : 'Update Exam'}
                                {!saving && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </motion.div>
    );
};

export default EditExam;
