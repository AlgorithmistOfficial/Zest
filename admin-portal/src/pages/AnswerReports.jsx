import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useActiveAdminBatch } from '../batch';
import PageHeader from '../components/PageHeader';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const AnswerReports = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const activeBatch = useActiveAdminBatch();

    useEffect(() => {
        const fetchReport = async () => {
            try {
                if (!activeBatch?._id) {
                    setRows([]);
                    return;
                }
                const res = await fetch(`${API_URL}/api/admin/reports/wrong-answers?batchId=${activeBatch._id}`);
                if (!res.ok) throw new Error('Failed to fetch report');
                const data = await res.json();
                setRows(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [activeBatch?._id]);

    return (
        <section className="space-y-6">
            <Helmet>
                <title>Admin - Answer Reports</title>
            </Helmet>

            <PageHeader
                title="Answer Reports"
                description="Wrong answers recorded during in-progress tests, grouped by student and question."
            />

            {!activeBatch?._id && (
                <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl font-bold border border-amber-100">
                    Select a batch from the navbar to view answer reports.
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
                {loading ? (
                    <p className="text-slate-500 font-medium">Loading report...</p>
                ) : rows.length === 0 ? (
                    <p className="text-slate-500 font-medium">No wrong-answer data available.</p>
                ) : (
                    <table className="w-full min-w-[1100px]">
                        <thead>
                            <tr className="text-left text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                                <th className="py-3 px-2">Student</th>
                                <th className="py-3 px-2">Email</th>
                                <th className="py-3 px-2">Test ID</th>
                                <th className="py-3 px-2">Q No.</th>
                                <th className="py-3 px-2">Question</th>
                                <th className="py-3 px-2">Type</th>
                                <th className="py-3 px-2">Correct Answer</th>
                                <th className="py-3 px-2">Student Answer</th>
                                <th className="py-3 px-2">Marks</th>
                                <th className="py-3 px-2">Recorded At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={`${row.studentEmail}-${row.testId}-${row.questionNo}-${idx}`} className="border-b border-slate-50 text-sm align-top">
                                    <td className="py-3 px-2 font-bold text-navy">{row.studentName}</td>
                                    <td className="py-3 px-2 text-slate-600">{row.studentEmail}</td>
                                    <td className="py-3 px-2 text-slate-600 font-mono">{row.testId}</td>
                                    <td className="py-3 px-2 font-black text-navy">{row.questionNo}</td>
                                    <td className="py-3 px-2 text-slate-600 max-w-[340px] whitespace-pre-wrap">{row.questionText}</td>
                                    <td className="py-3 px-2 text-slate-600">{row.questionType}</td>
                                    <td className="py-3 px-2 text-slate-600 max-w-[220px] whitespace-pre-wrap">{Array.isArray(row.correctAnswer) ? row.correctAnswer.join(', ') : String(row.correctAnswer ?? '')}</td>
                                    <td className="py-3 px-2 text-slate-600 max-w-[220px] whitespace-pre-wrap">{Array.isArray(row.studentAnswer) ? row.studentAnswer.join(', ') : String(row.studentAnswer ?? '')}</td>
                                    <td className="py-3 px-2 text-slate-700 font-black">{row.marks}</td>
                                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{row.recordedAt ? new Date(row.recordedAt).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
};

export default AnswerReports;