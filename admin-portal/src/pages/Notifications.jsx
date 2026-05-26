import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useActiveAdminBatch } from '../batch';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const activeBatch = useActiveAdminBatch();

    const fetchNotifications = useCallback(async () => {
        try {
            if (!activeBatch?._id) {
                setNotifications([]);
                return;
            }
            const res = await fetch(`${API_URL}/api/admin/notifications?batchId=${activeBatch._id}`);
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeBatch?._id]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleDecision = async (id, decision) => {
        try {
            setActionLoadingId(id);
            const res = await fetch(`${API_URL}/api/admin/notifications/${id}/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision })
            });
            if (!res.ok) throw new Error('Failed to update decision');
            await fetchNotifications();
        } catch (err) {
            console.error(err);
            alert('Failed to update request status.');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <section className="space-y-6">
            <Helmet>
                <title>ABCD - Notifications</title>
            </Helmet>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h1 className="text-3xl font-black text-navy mb-2 flex items-center gap-3">
                    <Bell className="text-lime" /> Notifications
                </h1>
                <p className="text-slate-500 font-medium">
                    Late-entry requests raised by students appear here for approval.
                </p>
                {!activeBatch?._id && (
                    <p className="mt-3 text-amber-600 font-bold">Select a batch from the navbar to view notifications.</p>
                )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
                {loading ? (
                    <p className="text-slate-500 font-medium">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <p className="text-slate-500 font-medium">No notifications available.</p>
                ) : (
                    <table className="w-full min-w-[760px]">
                        <thead>
                            <tr className="text-left text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                                <th className="py-3 px-2">Student</th>
                                <th className="py-3 px-2">Email</th>
                                <th className="py-3 px-2">Test ID</th>
                                <th className="py-3 px-2">Status</th>
                                <th className="py-3 px-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((n) => (
                                <tr key={n._id} className="border-b border-slate-50 text-sm">
                                    <td className="py-3 px-2 font-bold text-navy">{n.studentName}</td>
                                    <td className="py-3 px-2 text-slate-600">{n.studentEmail}</td>
                                    <td className="py-3 px-2 text-slate-600 font-mono">{n.testId}</td>
                                    <td className="py-3 px-2 capitalize font-bold text-slate-700">{n.status}</td>
                                    <td className="py-3 px-2">
                                        {n.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDecision(n._id, 'deny')}
                                                    disabled={actionLoadingId === n._id}
                                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    <span className="inline-flex items-center gap-1"><X size={14} /> Deny</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDecision(n._id, 'allow')}
                                                    disabled={actionLoadingId === n._id}
                                                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    <span className="inline-flex items-center gap-1"><Check size={14} /> Allow</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-semibold">No action</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
};

export default Notifications;
