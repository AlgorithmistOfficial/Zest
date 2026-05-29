import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useActiveAdminBatch } from '../batch';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Reports = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testIdInput, setTestIdInput] = useState('');
    const [submittedTestId, setSubmittedTestId] = useState('');
    const activeBatch = useActiveAdminBatch();

    const fetchReport = async (nextTestId) => {
        const trimmedTestId = String(nextTestId || '').trim();
        if (!trimmedTestId) {
            setRows([]);
            setSubmittedTestId('');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const url = new URL(`${API_URL}/api/admin/reports/alarms`);
            if (activeBatch?._id) {
                url.searchParams.set('batchId', activeBatch._id);
            }
            url.searchParams.set('testId', trimmedTestId);

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch report');
            const data = await res.json();
            setRows(data);
            setSubmittedTestId(trimmedTestId);
        } catch (err) {
            console.error(err);
            setRows([]);
            setSubmittedTestId(trimmedTestId);
        } finally {
            setLoading(false);
        }
    };

    const groupedRows = useMemo(() => {
        const map = new Map();
        rows.forEach((row) => {
            const key = `${row.studentEmail}-${row.testId}`;
            if (!map.has(key)) {
                map.set(key, {
                    studentName: row.studentName,
                    studentEmail: row.studentEmail,
                    testId: row.testId,
                    score: row.score,
                    alarmCount: row.alarmCount
                });
            }
        });
        return Array.from(map.values());
    }, [rows]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetchReport(testIdInput);
    };

    return (
        <section className="space-y-6">
            <Helmet>
                <title>Admin - Reports</title>
            </Helmet>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-navy mb-2">Reports</h1>
                        <p className="text-slate-500 font-medium">
                            Enter a test ID to load the student report for that test.
                        </p>
                        {!activeBatch?._id && (
                            <p className="mt-3 text-amber-600 font-bold">Select a batch from the navbar to scope the report.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={testIdInput}
                            onChange={(e) => setTestIdInput(e.target.value)}
                            placeholder="Enter test ID, e.g. 002"
                            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-navy outline-none transition-all placeholder:text-slate-400 focus:border-lime focus:bg-white"
                        />
                        <button
                            type="submit"
                            className="h-12 rounded-2xl bg-navy px-5 font-black text-white transition-all hover:bg-navy/90"
                        >
                            View Report
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                {loading ? (
                    <p className="text-slate-500 font-medium">Loading report...</p>
                ) : !submittedTestId ? (
                    <p className="text-slate-500 font-medium">Enter a test ID above to view the report.</p>
                ) : groupedRows.length === 0 ? (
                    <p className="text-slate-500 font-medium">No report data available.</p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {groupedRows.map((row) => (
                            <div key={`${row.studentEmail}-${row.testId}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Student</p>
                                        <h2 className="mt-1 text-xl font-black text-navy">{row.studentName}</h2>
                                        <p className="text-sm text-slate-500">{row.studentEmail}</p>
                                    </div>
                                    <div className="rounded-2xl bg-navy px-4 py-2 text-right text-white">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Test ID</p>
                                        <p className="font-mono text-lg font-black">{row.testId}</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-white p-4 border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Score</p>
                                        <p className="mt-1 text-2xl font-black text-navy">{row.score}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white p-4 border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Alarms Buzzed</p>
                                        <p className="mt-1 text-2xl font-black text-red-500">{row.alarmCount}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Reports;
