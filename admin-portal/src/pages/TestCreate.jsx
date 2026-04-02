import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const TestCreate = () => {
    const [testIdInput, setTestIdInput] = useState('');
    const [examInfo, setExamInfo] = useState(null);
    const [questions, setQuestions] = useState([]);
    
    const [verifying, setVerifying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const verifyTestId = async () => {
        if (!testIdInput.trim()) return;
        setVerifying(true);
        setError('');
        setSuccess('');
        
        try {
            // Check if test content already exists
            try {
                const existingContentRes = await api.get(`/test-contents/${testIdInput}`);
                if (existingContentRes.data) {
                    setExamInfo({
                        testId: existingContentRes.data.testId,
                        examName: existingContentRes.data.examName,
                        totalMarks: existingContentRes.data.totalMarks,
                        duration: existingContentRes.data.duration,
                    });
                    setQuestions(existingContentRes.data.questions || []);
                    setSuccess('Existing test content loaded. You can edit it now.');
                    setVerifying(false);
                    return;
                }
            } catch (err) {
                // Ignore 404 here, it means content doesn't exist yet, which is fine
            }

            // Verify with matching Exam scheduled
            const res = await api.get(`/exams/by-testid/${testIdInput}`);
            if (res.data) {
                setExamInfo({
                    testId: res.data.testId,
                    examName: res.data.examName,
                    totalMarks: res.data.totalMarks,
                    duration: res.data.duration,
                });
                setQuestions([{ id: Date.now().toString(), ques: '', type: 'single option answer', options: ['Option 1'], answerKey: '' }]);
                setSuccess('Test ID verified. You can generate questions now.');
            }
        } catch (err) {
            setError('Wrong ID entered. The test is either not scheduled or ID is invalid. Please rewrite.');
            setExamInfo(null);
            setQuestions([]);
        } finally {
            setVerifying(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { 
            id: Date.now().toString(), 
            ques: '', 
            type: 'single option answer', 
            options: ['Option 1'], 
            answerKey: '' 
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQs = [...questions];
        newQs[index][field] = value;
        setQuestions(newQs);
    };

    const deleteQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const addOption = (qIndex) => {
        const newQs = [...questions];
        const newOptionNum = (newQs[qIndex].options?.length || 0) + 1;
        newQs[qIndex].options = [...(newQs[qIndex].options || []), `Option ${newOptionNum}`];
        setQuestions(newQs);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQs = [...questions];
        newQs[qIndex].options[oIndex] = value;
        setQuestions(newQs);
    };

    const removeOption = (qIndex, oIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options = newQs[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQs);
    };

    const saveTest = async () => {
        if (!examInfo) return;
        setSaving(true);
        setError('');
        setSuccess('');

        // Provide minimal validation
        if (questions.length === 0) {
            setError('Please add at least one question.');
            setSaving(false);
            return;
        }

        try {
            const payload = {
                testId: examInfo.testId,
                examName: examInfo.examName,
                totalMarks: examInfo.totalMarks,
                duration: examInfo.duration,
                questions: questions.map(q => ({
                    ques: q.ques,
                    type: q.type,
                    options: ['single option answer', 'multiple option answer'].includes(q.type) ? q.options : [],
                    answerKey: q.answerKey
                }))
            };

            await api.post('/test-contents', payload);
            setSuccess('Test content saved successfully!');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError('Failed to save test content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 max-w-4xl mx-auto">
            <PageHeader title="Create Test Content" description="Design and configure questions for a scheduled test." />

            {/* Error/Success Messages */}
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

            {/* Step 1: Verify Test DB */}
            <div className="card mb-8">
                <h3 className="text-xl font-extrabold text-navy flex items-center gap-2 mb-4">
                    <Search className="text-lime" /> Connect to Scheduled Test
                </h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Test ID (e.g. TST123)..."
                        className="input-field flex-1 text-lg font-bold"
                        value={testIdInput}
                        onChange={(e) => setTestIdInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && verifyTestId()}
                    />
                    <button onClick={verifyTestId} disabled={verifying} className="btn btn-primary px-8 text-base">
                        {verifying ? 'Verifying...' : 'Verify & Load'}
                    </button>
                </div>
                {examInfo && (
                    <div className="mt-4 p-4 bg-lime/10 border border-lime/20 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-xs text-slate-500 font-bold uppercase">Exam Name</p><p className="font-extrabold text-navy">{examInfo.examName}</p></div>
                        <div><p className="text-xs text-slate-500 font-bold uppercase">Test ID</p><p className="font-extrabold text-navy">{examInfo.testId}</p></div>
                        <div><p className="text-xs text-slate-500 font-bold uppercase">Total Marks</p><p className="font-extrabold text-navy">{examInfo.totalMarks}</p></div>
                        <div><p className="text-xs text-slate-500 font-bold uppercase">Duration</p><p className="font-extrabold text-navy">{examInfo.duration}m</p></div>
                    </div>
                )}
            </div>

            {/* Step 2: Question Builder (Google Forms Style) */}
            {examInfo && (
                <div className="space-y-6 relative">
                    <AnimatePresence>
                        {questions.map((q, qIndex) => (
                            <motion.div
                                key={q.id || qIndex}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card border-l-4 border-l-lime group transition-all focus-within:shadow-xl focus-within:border-l-navy"
                            >
                                <div className="flex justify-between items-start mb-4 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Question Statement..."
                                        className="w-full text-xl font-bold text-navy placeholder:text-slate-300 border-b-2 border-transparent focus:border-navy pb-2 focus:outline-none transition-colors"
                                        value={q.ques}
                                        onChange={(e) => updateQuestion(qIndex, 'ques', e.target.value)}
                                    />
                                    <select
                                        className="input-field w-56 shrink-0 bg-slate-50 font-semibold"
                                        value={q.type}
                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                    >
                                        <option value="single option answer">Single Choice</option>
                                        <option value="multiple option answer">Multiple Choice</option>
                                        <option value="value enter answer">Short Text / Value</option>
                                        <option value="write code answer">Write Code (Java)</option>
                                    </select>
                                </div>

                                {/* Options based on type */}
                                {['single option answer', 'multiple option answer'].includes(q.type) && (
                                    <div className="space-y-2 mt-4 ml-2">
                                        {q.options?.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 ${q.type === 'single option answer' ? 'border-slate-300' : 'border-slate-300 rounded-md'}`}></div>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    className="flex-1 font-medium bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none py-1"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                />
                                                {q.options.length > 1 && (
                                                    <button onClick={() => removeOption(qIndex, oIndex)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="w-5 h-5"></div>
                                            <button onClick={() => addOption(qIndex)} className="text-slate-400 hover:text-navy font-semibold text-sm transition-colors cursor-pointer">
                                                Add option
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Answer Key */}
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex-1 flex items-center gap-3">
                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">Answer Key</span>
                                        <input
                                            type="text"
                                            placeholder="Enter correct answer(s)..."
                                            className="input-field py-1.5 flex-1"
                                            value={q.answerKey}
                                            onChange={(e) => updateQuestion(qIndex, 'answerKey', e.target.value)}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        <button onClick={() => deleteQuestion(qIndex)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Delete Question">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Floating Form Controls */}
                    <div className="flex justify-center mt-8 gap-4">
                        <button onClick={addQuestion} className="bg-white border-2 border-lime text-navy hover:bg-lime/10 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all hover:-translate-y-1">
                            <Plus size={20} /> Add Question
                        </button>
                        <button onClick={saveTest} disabled={saving} className="bg-navy border-2 border-navy text-white hover:bg-navy/90 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all hover:-translate-y-1">
                            <Save size={20} /> {saving ? 'Saving...' : 'Save Complete Test'}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TestCreate;
