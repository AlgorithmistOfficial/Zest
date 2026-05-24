import React, { useEffect, useState } from 'react';
import { useActiveAdminBatch } from '../batch';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Attendance = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const activeBatch = useActiveAdminBatch();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                if (!activeBatch?._id) {
                    setTests([]);
                    return;
                }
                const res = await fetch(`${API_URL}/api/admin/attendance?batchId=${activeBatch._id}`);
                if (!res.ok) throw new Error('Failed to fetch attendance');
                const data = await res.json();
                setTests(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [activeBatch?._id]);

    return (
        <section className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h1 className="text-3xl font-black text-navy mb-2">Attendance Panel</h1>
                <p className="text-slate-500 font-medium">
                    Attendance is based on test score entries. Score -1 means absent.
                </p>
                {!activeBatch?._id && (
                    <p className="mt-3 text-amber-600 font-bold">Select a batch from the navbar to view attendance.</p>
                )}
            </div>

            {loading ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-slate-500">Loading attendance...</div>
            ) : tests.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-slate-500">No attendance data found.</div>
            ) : (
                tests.map((test) => (
                    <div key={test.testId} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-xl font-black text-navy">{test.examName}</h2>
                                <p className="text-slate-500 text-sm font-medium">Test ID: {test.testId}</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-bold">Present: {test.present}</span>
                                <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 font-bold">Absent: {test.absent}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px]">
                                <thead>
                                    <tr className="text-left text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                                        <th className="py-3 px-2">Student Name</th>
                                        <th className="py-3 px-2">Email</th>
                                        <th className="py-3 px-2">Status</th>
                                        <th className="py-3 px-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(test.rows || []).map((row, idx) => (
                                        <tr key={`${test.testId}-${row.studentEmail}-${idx}`} className="border-b border-slate-50 text-sm">
                                            <td className="py-3 px-2 font-bold text-navy">{row.studentName}</td>
                                            <td className="py-3 px-2 text-slate-600">{row.studentEmail}</td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${row.status === 'present' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-slate-600 font-bold">{row.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </section>
    );
};

export default Attendance;
