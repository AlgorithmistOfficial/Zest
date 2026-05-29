import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search, BookOpen, X, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useActiveAdminBatch } from '../batch';
import PageHeader from '../components/PageHeader';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const AnswerReports = () => {
    const [tests, setTests] = useState([]);
    const [rows, setRows] = useState([]);
    const [loadingTests, setLoadingTests] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState('');
    const [testMenuOpen, setTestMenuOpen] = useState(false);
    const [studentInput, setStudentInput] = useState('');
    const [submittedStudentQuery, setSubmittedStudentQuery] = useState('');
    const activeBatch = useActiveAdminBatch();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setTestMenuOpen(false);
            }
        };

        window.addEventListener('mousedown', handleOutsideClick);
        return () => window.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoadingTests(true);
                setRows([]);
                setSelectedTestId('');
                setSubmittedStudentQuery('');
                setStudentInput('');

                if (!activeBatch?._id) {
                    setTests([]);
                    return;
                }

                const res = await fetch(`${API_URL}/api/exams?batchId=${activeBatch._id}`);
                if (!res.ok) throw new Error('Failed to fetch tests');
                const data = await res.json();
                setTests(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setTests([]);
            } finally {
                setLoadingTests(false);
            }
        };

        fetchTests();
    }, [activeBatch?._id]);

    const fetchReport = async (testId) => {
        const trimmedTestId = String(testId || '').trim();
        if (!trimmedTestId) {
            setRows([]);
            return;
        }

        try {
            setLoadingReport(true);
            const url = new URL(`${API_URL}/api/admin/reports/wrong-answers`);
            if (activeBatch?._id) {
                url.searchParams.set('batchId', activeBatch._id);
            }
            url.searchParams.set('testId', trimmedTestId);
            if (submittedStudentQuery.trim()) {
                url.searchParams.set('student', submittedStudentQuery.trim());
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch report');
            const data = await res.json();
            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setRows([]);
        } finally {
            setLoadingReport(false);
        }
    };

    const handleSelectTest = async (test) => {
        setSelectedTestId(test.testId);
        setTestMenuOpen(false);
        setSubmittedStudentQuery('');
        setStudentInput('');
        await fetchReport(test.testId);
    };

    const handleStudentSearch = async (event) => {
        event.preventDefault();
        setSubmittedStudentQuery(studentInput.trim());
        if (selectedTestId) {
            await fetchReport(selectedTestId);
        }
    };

    const selectedTest = tests.find((test) => String(test.testId) === String(selectedTestId));

    const groupedRows = useMemo(() => {
        const map = new Map();
        rows.forEach((row) => {
            const key = `${row.studentEmail}-${row.testId}`;
            if (!map.has(key)) {
                map.set(key, {
                    studentName: row.studentName,
                    studentEmail: row.studentEmail,
                    testId: row.testId,
                    unattemptedCount: row.unattemptedCount || 0,
                    unattemptedQuestionNos: row.unattemptedQuestionNos || [],
                    attempts: []
                });
            }
            map.get(key).attempts.push(row);
        });
        return Array.from(map.values());
    }, [rows]);

    const renderedRows = useMemo(() => groupedRows.filter((group) => {
        const search = submittedStudentQuery.trim().toLowerCase();
        if (!search) return true;
        return group.studentName.toLowerCase().includes(search) || group.studentEmail.toLowerCase().includes(search);
    }), [groupedRows, submittedStudentQuery]);

    return (
        <section className="space-y-6">
            <Helmet>
                <title>Admin - Answer Reports</title>
            </Helmet>

            <PageHeader
                title="Answer Reports"
                description="Pick a test first, then search for a student to inspect the wrong answers recorded during that test."
            />

            {!activeBatch?._id && (
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 font-bold text-amber-700">
                    Select a batch from the navbar to view answer reports.
                </div>
            )}

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
                    <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Step 1</p>
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setTestMenuOpen((prev) => !prev)}
                                disabled={loadingTests || tests.length === 0}
                                className={`flex h-14 w-full items-center justify-between rounded-[1.4rem] border px-4 text-left transition-all duration-300 ${
                                    testMenuOpen
                                        ? 'border-lime/40 bg-lime/5 shadow-[0_10px_30px_rgba(146,194,17,0.12)]'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy text-white shadow-md shadow-navy/10">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Select Test</p>
                                        <p className="max-w-[360px] truncate text-sm font-black text-navy">
                                            {selectedTest ? `${selectedTest.examName} • ${selectedTest.testId}` : 'Choose a test'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${testMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {testMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                        className="absolute z-30 mt-3 w-full overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                                    >
                                        <div className="border-b border-slate-100 bg-gradient-to-r from-navy to-[#1b2942] px-4 py-3 text-white">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Available Tests</p>
                                            <p className="mt-1 text-sm font-bold">{tests.length} tests in this batch</p>
                                        </div>

                                        <div className="max-h-72 overflow-y-auto p-2">
                                            {loadingTests ? (
                                                <div className="rounded-2xl px-4 py-5 text-sm font-medium text-slate-500">Loading tests...</div>
                                            ) : tests.length === 0 ? (
                                                <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">No tests available for this batch.</div>
                                            ) : (
                                                tests.map((test, index) => {
                                                    const active = String(test.testId) === String(selectedTestId);
                                                    return (
                                                        <motion.button
                                                            key={test._id || `${test.testId}-${index}`}
                                                            type="button"
                                                            onClick={() => handleSelectTest(test)}
                                                            initial={{ opacity: 0, x: 8 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.14, delay: index * 0.02 }}
                                                            className={`mb-1 w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                                                                active
                                                                    ? 'border-lime/40 bg-lime/10 shadow-sm'
                                                                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-sm font-black text-navy">{test.examName}</p>
                                                                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Test ID: {test.testId}</p>
                                                                </div>
                                                                {active && (
                                                                    <span className="rounded-full bg-lime px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-navy">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <form onSubmit={handleStudentSearch} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Step 2</p>
                            <div className="flex h-14 items-center rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-lime focus-within:bg-white">
                                <Search size={16} className="mr-3 shrink-0 text-slate-400" />
                                <input
                                    type="text"
                                    value={studentInput}
                                    onChange={(e) => setStudentInput(e.target.value)}
                                    placeholder="Search student by name or email"
                                    className="w-full border-none bg-transparent text-sm font-semibold text-navy outline-none placeholder:text-slate-400"
                                />
                                {studentInput && (
                                    <button
                                        type="button"
                                        onClick={() => setStudentInput('')}
                                        className="ml-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!selectedTestId || loadingReport}
                            className="h-14 rounded-[1.4rem] bg-navy px-6 text-sm font-black text-white shadow-lg shadow-navy/10 transition-all hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loadingReport ? 'Searching...' : 'Search Student'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                {!selectedTestId ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                        <Sparkles className="mb-3 text-lime" size={32} />
                        <p className="text-lg font-black text-navy">Pick a test to begin</p>
                        <p className="mt-2 max-w-lg text-sm font-medium text-slate-500">
                            The wrong-answer report will appear after you choose a test and search for a student.
                        </p>
                    </div>
                ) : loadingReport ? (
                    <p className="text-slate-500 font-medium">Loading report...</p>
                ) : renderedRows.length === 0 ? (
                    <p className="text-slate-500 font-medium">No wrong-answer data available for the selected test and student.</p>
                ) : (
                    <div className="space-y-5">
                        <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Selected Test</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-black text-navy">{selectedTest?.examName || selectedTestId}</h2>
                                <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                    Test ID {selectedTestId}
                                </span>
                                {submittedStudentQuery && (
                                    <span className="rounded-full bg-lime/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-lime">
                                        Student: {submittedStudentQuery}
                                    </span>
                                )}
                            </div>
                        </div>

                        {renderedRows.map((group) => (
                            <div key={`${group.studentEmail}-${group.testId}`} className="overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm">
                                <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Student</p>
                                        <h3 className="mt-1 text-2xl font-black text-navy">{group.studentName}</h3>
                                        <p className="text-sm font-medium text-slate-500">{group.studentEmail}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                            {group.attempts.length} wrong answers
                                        </span>
                                        {Number(group.unattemptedCount) > 0 && (
                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-amber-700">
                                                {group.unattemptedCount} unattempted
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 p-5">
                                    {group.attempts.map((attempt) => (
                                        <div key={`${attempt.studentEmail}-${attempt.testId}-${attempt.questionNo}`} className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-5">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="max-w-4xl">
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                                            Q {attempt.questionNo}
                                                        </span>
                                                        <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                                                            {attempt.questionType}
                                                        </span>
                                                        <span className="rounded-full bg-lime/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-lime">
                                                            {attempt.marks} marks
                                                        </span>
                                                    </div>
                                                    <p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-navy">
                                                        {attempt.questionText}
                                                    </p>
                                                </div>

                                                <div className="grid min-w-[260px] gap-3 rounded-[1.2rem] bg-white p-4 border border-slate-100">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Correct Answer</p>
                                                        <p className="mt-1 whitespace-pre-wrap text-sm font-bold text-emerald-700">
                                                            {Array.isArray(attempt.correctAnswer) ? attempt.correctAnswer.join(', ') : String(attempt.correctAnswer ?? '-')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Student Answer</p>
                                                        <p className="mt-1 whitespace-pre-wrap text-sm font-bold text-rose-600">
                                                            {Array.isArray(attempt.studentAnswer) ? attempt.studentAnswer.join(', ') : String(attempt.studentAnswer ?? '-')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {renderedRows.some((group) => Number(group.unattemptedCount) > 0) && (
                            <div className="rounded-[1.6rem] border border-amber-100 bg-amber-50 p-5 text-amber-800">
                                <p className="text-sm font-black uppercase tracking-[0.24em]">Unattempted Summary</p>
                                <p className="mt-2 text-sm font-semibold">
                                    The selected test also has unattempted questions recorded in the wrong-answer store. Question numbers: {
                                        renderedRows
                                            .flatMap((group) => group.unattemptedQuestionNos || [])
                                            .filter((value, index, self) => self.indexOf(value) === index)
                                            .sort((a, b) => a - b)
                                            .join(', ') || '-'
                                    }.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AnswerReports;
