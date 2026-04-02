import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCcw, HardDrive, Layout, Users, FileText, Lock, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const StorageMetrics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/admin/storage-stats');
            setData(res.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch storage statistics. Ensure MongoDB is reachable.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // 1-minute auto refresh
        return () => clearInterval(interval);
    }, []);

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('student')) return <Users size={16} />;
        if (n.includes('exam')) return <Layout size={16} />;
        if (n.includes('test')) return <FileText size={16} />;
        if (n.includes('otp')) return <Lock size={16} />;
        return <Database size={16} />;
    };

    if (loading) return <div className="text-center py-24 text-slate-400 font-bold text-lg">Loading storage metrics...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-16 max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-2">
                <PageHeader title="Database Storage" description="Real-time breakdown of MongoDB space usage by system components." />
                <button 
                    onClick={fetchStats} 
                    disabled={refreshing}
                    className={`mt-6 btn flex items-center gap-2 ${refreshing ? 'bg-slate-100 text-slate-400' : 'bg-white border-2 border-slate-100 text-navy hover:bg-slate-50'}`}
                >
                    <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Updating...' : 'Refresh Now'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-100 mb-6">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {data && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card bg-white border-slate-100 relative overflow-hidden group">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-lime/10 rounded-2xl flex items-center justify-center">
                                    <HardDrive size={24} className="text-navy" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Storage Used</p>
                                    <h2 className="text-2xl font-black text-navy">{formatSize(data.totalStorageUsed)}</h2>
                                    <span className="text-[10px] font-black text-lime uppercase tracking-widest">
                                        {data.totalPercentageUsed}% of {formatSize(data.maxStorageBytes)}
                                    </span>
                                </div>
                            </div>
                            {/* Simple background progress indicator */}
                            <div className="absolute bottom-0 left-0 h-1 bg-lime/20 w-full">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.totalPercentageUsed}%` }}
                                    className="h-full bg-lime"
                                />
                            </div>
                        </div>
                        <div className="card bg-white border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-lime/10 rounded-2xl flex items-center justify-center">
                                    <Database size={24} className="text-navy" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Collections</p>
                                    <h2 className="text-2xl font-black text-navy">{data.collections.length}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="card bg-white border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-lime/10 rounded-2xl flex items-center justify-center">
                                    <TrendingUp size={24} className="text-navy" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Database Health</p>
                                    <h2 className="text-2xl font-black text-lime">
                                        {parseFloat(data.totalPercentageUsed) > 85 ? 'Critical' : parseFloat(data.totalPercentageUsed) > 70 ? 'Warning' : 'Excellent'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="card">
                        <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-black text-navy flex items-center gap-2 uppercase tracking-tighter">
                                    <HardDrive size={20} className="text-lime" /> Total Capacity Usage
                                </h3>
                                <span className="text-sm font-black text-navy bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                    {data.totalPercentageUsed}% Used
                                </span>
                            </div>
                            <div className="h-4 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.totalPercentageUsed}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full rounded-full transition-colors ${
                                        parseFloat(data.totalPercentageUsed) > 85 ? 'bg-red-500' : parseFloat(data.totalPercentageUsed) > 70 ? 'bg-amber-500' : 'bg-navy'
                                    }`}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span>0 MB</span>
                                <span>{formatSize(data.maxStorageBytes / 2)}</span>
                                <span>{formatSize(data.maxStorageBytes)} Limit</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-extrabold text-navy mb-6 flex items-center gap-2">
                            <Layout size={20} className="text-lime" /> Component Breakdown
                        </h3>
                        <div className="space-y-8">
                            {data.collections.map((coll, idx) => (
                                <div key={coll.name} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-navy shadow-sm">
                                                {getIcon(coll.name)}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-navy uppercase text-sm tracking-tight">{coll.name}</h4>
                                                <p className="text-xs text-slate-400 font-bold">{coll.documents.toLocaleString()} documents</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-navy">{coll.percentage}%</span>
                                            <p className="text-xs text-slate-400 font-bold uppercase">{formatSize(coll.sizeBytes)}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${coll.percentage}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                            className={`h-full rounded-full ${
                                                parseFloat(coll.percentage) > 50 ? 'bg-navy' : 'bg-lime'
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 text-center bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-sm italic">
                            Storage metrics are calculated based on raw compressed physical storage size on MongoDB Atlas.
                        </p>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default StorageMetrics;
