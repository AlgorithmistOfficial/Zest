import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useActiveAdminBatch } from '../batch';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Reports = () => {
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
                const res = await fetch(`${API_URL}/api/admin/reports/alarms?batchId=${activeBatch._id}`);
                if (!res.ok) throw new Error('Failed to fetch report');
                const data = await res.json();
                setRows(data);
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
                <title>Admin - Reports</title>
            </Helmet>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h1 className="text-3xl font-black text-navy mb-2">Reports</h1>
                <p className="text-slate-500 font-medium">
                    Alarm buzz count by student and test.
                </p>
                {!activeBatch?._id && (
                    <p className="mt-3 text-amber-600 font-bold">Select a batch from the navbar to view reports.</p>
                )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
                {loading ? (
                    <p className="text-slate-500 font-medium">Loading report...</p>
                ) : rows.length === 0 ? (
                    <p className="text-slate-500 font-medium">No report data available.</p>
                ) : (
                    <table className="w-full min-w-[760px]">
                        <thead>
                            <tr className="text-left text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                                <th className="py-3 px-2">Student Name</th>
                                <th className="py-3 px-2">Email</th>
                                <th className="py-3 px-2">Test ID</th>
                                <th className="py-3 px-2">Score</th>
                                <th className="py-3 px-2">Alarms Buzzed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={`${row.studentEmail}-${row.testId}-${idx}`} className="border-b border-slate-50 text-sm">
                                    <td className="py-3 px-2 font-bold text-navy">{row.studentName}</td>
                                    <td className="py-3 px-2 text-slate-600">{row.studentEmail}</td>
                                    <td className="py-3 px-2 text-slate-600 font-mono">{row.testId}</td>
                                    <td className="py-3 px-2 text-slate-600">{row.score}</td>
                                    <td className="py-3 px-2 text-slate-700 font-black">{row.alarmCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
};

export default Reports;
