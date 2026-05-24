import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Layers3, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://Shreyansh6726-zest.hf.space';

const SelectBatch = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'), []);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchBatches = async () => {
      try {
        const res = await fetch(`${API_URL}/api/batches`);
        if (!res.ok) throw new Error('Failed to load batches');
        const data = await res.json();
        setBatches(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedBatchId(data[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Unable to load batches');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/auth');
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !selectedBatchId) return;

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/select-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ batchId: selectedBatchId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save batch');

      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(data.user));
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to select batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffef2] text-navy font-sans selection:bg-lime/30 flex flex-col overflow-x-hidden">
      <nav className="fixed w-full z-50 bg-[#92c211] backdrop-blur-md border-b border-white/20 py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Zest Logo" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold text-xl tracking-tight">Zest</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-bold"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-28 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-navy/5 overflow-hidden"
        >
          <div className="p-8 md:p-10 border-b border-slate-100 bg-gradient-to-br from-lime/10 via-white to-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 text-navy text-xs font-black uppercase tracking-widest mb-5">
              <Layers3 size={14} /> Batch Selection
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Choose your batch before continuing</h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              {user.name ? `${user.name}, ` : ''}your dashboard, test schedule, and leaderboard will be filtered by the batch you select here.
            </p>
          </div>

          <div className="p-8 md:p-10">
            {loading ? (
              <div className="py-16 text-center text-slate-500 font-semibold">Loading batches...</div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-100 mb-6">
                <AlertCircle size={18} /> {error}
              </div>
            ) : batches.length === 0 ? (
              <div className="bg-amber-50 text-amber-700 p-5 rounded-2xl border border-amber-100">
                No batches are available yet. Ask an admin to create one first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {batches.map((batch) => (
                    <button
                      key={batch._id}
                      type="button"
                      onClick={() => setSelectedBatchId(batch._id)}
                      className={`text-left p-5 rounded-3xl border-2 transition-all duration-300 ${selectedBatchId === batch._id
                        ? 'border-lime bg-lime/5 shadow-lg shadow-lime/10'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black text-navy">{batch.name}</h3>
                          <p className="text-sm text-slate-400 font-semibold uppercase tracking-widest mt-1">{batch.slug}</p>
                        </div>
                        {selectedBatchId === batch._id && (
                          <div className="w-8 h-8 rounded-full bg-lime text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving || !selectedBatchId}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-navy text-white font-bold text-lg hover:opacity-95 disabled:opacity-60 transition-all"
                >
                  {saving ? 'Saving...' : 'Continue to dashboard'}
                  {!saving && <ArrowRight size={18} />}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SelectBatch;
