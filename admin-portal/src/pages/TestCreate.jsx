import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Save, CheckCircle2, AlertCircle, Code, Layers, FileText, Award, RotateCcw, ChevronDown, Circle, Square, Type, Check } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const ResponseTypeDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const options = [
        { value: 'single option answer', label: 'Single Choice', icon: Circle, desc: 'One correct answer' },
        { value: 'multiple option answer', label: 'Multiple Choice', icon: Square, desc: 'Multi-select correct' },
        { value: 'value enter answer', label: 'Short Text / Value', icon: Type, desc: 'Text or numeric input' },
        { value: 'write code answer', label: 'Write Code (Java)', icon: Code, desc: 'Auto-evaluated compiler' },
    ];

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 rounded-2xl transition-all duration-300 ${
                    isOpen ? 'border-lime shadow-[0_0_0_4px_rgba(146,194,17,0.1)]' : 'border-slate-100 hover:border-slate-200'
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-slate-50 text-navy rounded-xl shrink-0">
                        <selectedOption.icon size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-black text-navy leading-none mb-0.5">{selectedOption.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter leading-none">{selectedOption.desc}</p>
                    </div>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-lime' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 right-0 top-full z-50 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-2xl p-2 overflow-hidden"
                        >
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                                        value === opt.value ? 'bg-lime/5' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${
                                            value === opt.value ? 'bg-lime text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-navy'
                                        }`}>
                                            <opt.icon size={16} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-sm font-bold leading-none mb-0.5 ${value === opt.value ? 'text-navy' : 'text-slate-600'}`}>{opt.label}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{opt.desc}</p>
                                        </div>
                                    </div>
                                    {value === opt.value && (
                                        <div className="w-5 h-5 bg-lime text-white rounded-full flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

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
                    // Metadata comes from the Exams DB (merged by the backend GET handler)
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
                // Ignore 404
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
                setQuestions([{ 
                    id: Date.now().toString(), 
                    ques: '', 
                    type: 'single option answer', 
                    options: ['Option 1'], 
                    testCases: [{ input: '', output: '' }],
                    marks: 1,
                    answerKey: '' 
                }]);
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
            testCases: [{ input: '', output: '' }],
            marks: 1,
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
        const removedVal = newQs[qIndex].options[oIndex];
        newQs[qIndex].options = newQs[qIndex].options.filter((_, i) => i !== oIndex);
        
        // Clean up answerKey
        if (newQs[qIndex].type === 'single option answer' && newQs[qIndex].answerKey === removedVal) {
            newQs[qIndex].answerKey = '';
        } else if (newQs[qIndex].type === 'multiple option answer' && Array.isArray(newQs[qIndex].answerKey)) {
            newQs[qIndex].answerKey = newQs[qIndex].answerKey.filter(v => v !== removedVal);
        }
        setQuestions(newQs);
    };

    const addTestCase = (qIndex) => {
        const newQs = [...questions];
        newQs[qIndex].testCases = [...(newQs[qIndex].testCases || []), { input: '', output: '' }];
        setQuestions(newQs);
    };

    const updateTestCase = (qIndex, tcIndex, field, value) => {
        const newQs = [...questions];
        newQs[qIndex].testCases[tcIndex][field] = value;
        setQuestions(newQs);
    };

    const removeTestCase = (qIndex, tcIndex) => {
        const newQs = [...questions];
        newQs[qIndex].testCases = newQs[qIndex].testCases.filter((_, i) => i !== tcIndex);
        setQuestions(newQs);
    };

    const clearDesign = () => {
        if (window.confirm('Are you sure you want to clear the entire test design? This will remove all questions.')) {
            setQuestions([{ 
                id: Date.now().toString(), 
                ques: '', 
                type: 'single option answer', 
                options: ['Option 1'], 
                testCases: [{ input: '', output: '' }],
                marks: 1,
                answerKey: '' 
            }]);
            setSuccess('Design cleared.');
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const saveTest = async () => {
        if (!examInfo) return;
        setSaving(true);
        setError('');
        setSuccess('');

        if (questions.length === 0) {
            setError('Please add at least one question.');
            setSaving(false);
            return;
        }

        try {
            // Only persist testId + questions; exam metadata stays in the Exams collection
            const payload = {
                testId: examInfo.testId,
                questions: questions.map(q => ({
                    ques: q.ques,
                    type: q.type,
                    options: ['single option answer', 'multiple option answer'].includes(q.type) ? q.options : [],
                    testCases: q.type === 'write code answer' ? q.testCases : [],
                    marks: Number(q.marks),
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 max-w-5xl mx-auto">
            <PageHeader title="Advanced Test Designer" description="Build complex evaluations with dynamic answer keys, test cases, and question-level settings." />

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

            {examInfo && (
                <div className="space-y-6">
                    <AnimatePresence>
                        {questions.map((q, qIndex) => (
                            <motion.div
                                key={q.id || qIndex}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card border-l-4 border-l-lime group transition-all shadow-md hover:shadow-xl focus-within:shadow-2xl focus-within:border-l-navy"
                            >
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            <FileText size={14} /> Question {qIndex + 1}
                                        </div>
                                        
                                        {/* Row with individual settings */}
                                        <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2">
                                            <Award size={14} className="text-lime" />
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Marks</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-12 bg-transparent text-sm font-black text-navy focus:outline-none"
                                                value={q.marks}
                                                onChange={(e) => updateQuestion(qIndex, 'marks', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <textarea
                                                placeholder="Write your question statement here..."
                                                className="w-full text-xl font-bold text-navy placeholder:text-slate-300 bg-slate-50/50 p-4 rounded-2xl min-h-[100px] border-2 border-transparent focus:border-lime/30 focus:outline-none transition-all resize-none shadow-inner"
                                                value={q.ques}
                                                onChange={(e) => updateQuestion(qIndex, 'ques', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-72 shrink-0">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mb-2 block ml-1">Response Type</label>
                                            <ResponseTypeDropdown
                                                value={q.type}
                                                onChange={(val) => updateQuestion(qIndex, 'type', val)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {['single option answer', 'multiple option answer'].includes(q.type) && (
                                    <div className="mb-8 pl-4 space-y-3">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest mb-2">
                                            <Layers size={14} /> Define Options
                                        </div>
                                        {q.options?.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-4">
                                                <div className={`w-6 h-6 flex items-center justify-center shrink-0 border-2 rounded-lg font-bold text-[10px] ${q.type === 'single option answer' ? 'border-slate-200 rounded-full' : 'border-slate-200'}`}>
                                                    {oIndex + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    className="flex-1 font-bold text-navy bg-transparent border-b-2 border-transparent focus:border-slate-200 focus:outline-none py-1.5"
                                                    placeholder="Enter option text..."
                                                />
                                                {q.options.length > 1 && (
                                                    <button onClick={() => removeOption(qIndex, oIndex)} className="text-slate-300 hover:text-red-500 transition-colors px-2">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={() => addOption(qIndex)} className="ml-10 text-lime hover:text-navy font-bold text-sm flex items-center gap-2 transition-colors mt-2">
                                            <Plus size={16} /> Add option
                                        </button>
                                    </div>
                                )}

                                {q.type === 'write code answer' && (
                                    <div className="mb-8 pl-4 space-y-4">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest mb-2">
                                            <Code size={14} /> Java Test Cases
                                        </div>
                                        <div className="grid gap-4">
                                            {q.testCases?.map((tc, tcIndex) => (
                                                <div key={tcIndex} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 relative group/tc">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Case Input</label>
                                                        <textarea
                                                            placeholder="Standard Input (stdin)"
                                                            className="w-full bg-white p-3 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-lime/40"
                                                            value={tc.input}
                                                            onChange={(e) => updateTestCase(qIndex, tcIndex, 'input', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Output</label>
                                                        <textarea
                                                            placeholder="Standard Output (stdout)"
                                                            className="w-full bg-white p-3 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:border-lime/40"
                                                            value={tc.output}
                                                            onChange={(e) => updateTestCase(qIndex, tcIndex, 'output', e.target.value)}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => removeTestCase(qIndex, tcIndex)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-white shadow-md border border-slate-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/tc:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => addTestCase(qIndex)} className="text-lime hover:text-navy font-bold text-sm flex items-center gap-2 transition-colors mt-2">
                                                <Plus size={16} /> Add Test Case
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-center gap-2 min-w-32">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-sm font-black text-navy uppercase tracking-tighter">Correct Answer</span>
                                        </div>
                                        
                                        {q.type === 'single option answer' && (
                                            <select
                                                className="input-field bg-green-50/50 border-green-100 text-green-700 font-bold py-1.5"
                                                value={q.answerKey}
                                                onChange={(e) => updateQuestion(qIndex, 'answerKey', e.target.value)}
                                            >
                                                <option value="">Select correct option...</option>
                                                {q.options?.map((opt, i) => (
                                                    <option key={i} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}

                                        {q.type === 'multiple option answer' && (
                                            <div className="flex flex-wrap gap-2">
                                                {q.options?.map((opt, i) => {
                                                    const isSelected = Array.isArray(q.answerKey) && q.answerKey.includes(opt);
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                const current = Array.isArray(q.answerKey) ? q.answerKey : [];
                                                                const next = isSelected ? current.filter(v => v !== opt) : [...current, opt];
                                                                updateQuestion(qIndex, 'answerKey', next);
                                                            }}
                                                            className={`px-4 py-1.5 rounded-xl font-bold text-sm transition-all border-2 ${
                                                                isSelected 
                                                                    ? 'bg-navy text-white border-navy shadow-lg' 
                                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {q.type === 'value enter answer' && (
                                            <input
                                                type="text"
                                                placeholder="Enter correct numerical or text value..."
                                                className="input-field py-1.5 flex-1 bg-green-50/50 border-green-100 text-green-700 font-bold"
                                                value={q.answerKey}
                                                onChange={(e) => updateQuestion(qIndex, 'answerKey', e.target.value)}
                                            />
                                        )}

                                        {q.type === 'write code answer' && (
                                            <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                                <p className="text-green-700 font-bold text-xs">Evaluated via Test Cases above.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 shrink-0 self-end md:self-center">
                                        <button 
                                            onClick={() => deleteQuestion(qIndex)} 
                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                                            title="Delete Entire Question"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12 py-8 border-t border-slate-100">
                        <button onClick={clearDesign} className="w-full md:w-auto bg-red-50 border-2 border-red-100 text-red-600 hover:bg-red-100 px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95">
                            <RotateCcw size={20} /> Clear Design
                        </button>
                        <button onClick={addQuestion} className="w-full md:w-auto bg-white border-2 border-lime text-navy hover:bg-lime/10 px-10 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                            <Plus size={22} /> Add Another Question
                        </button>
                        <button onClick={saveTest} disabled={saving} className="w-full md:w-auto bg-navy border-2 border-navy text-white hover:bg-navy/90 px-10 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                            <Save size={22} /> {saving ? 'Finalizing...' : 'Save Entire Test Design'}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TestCreate;
