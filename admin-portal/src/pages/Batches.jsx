import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers3, Plus, Pencil, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import { getActiveAdminBatch, setActiveAdminBatch } from '../batch';
import PageHeader from '../components/PageHeader';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [activeBatchId, setActiveBatchId] = useState(getActiveAdminBatch()?._id || '');
  const [newBatchName, setNewBatchName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadBatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/batches');
      setBatches(Array.isArray(res.data) ? res.data : []);
      const current = getActiveAdminBatch();
      if (current?._id && !activeBatchId) {
        setActiveBatchId(current._id);
      }
    } catch (err) {
      setError('Failed to load batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const flashSuccess = (message) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3000);
  };

  const handleCreate = async () => {
    if (!newBatchName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/batches', { name: newBatchName.trim() });
      const created = res.data.batch;
      setNewBatchName('');
      setBatches((prev) => [...prev, created]);
      setActiveBatchId(created._id);
      setActiveAdminBatch(created);
      flashSuccess('Batch created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (batch) => {
    setEditingId(batch._id);
    setEditingName(batch.name);
  };

  const handleRename = async (batchId) => {
    if (!editingName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.put(`/batches/${batchId}`, { name: editingName.trim() });
      const updated = res.data.batch;
      setBatches((prev) => prev.map((batch) => (batch._id === batchId ? updated : batch)));
      if (activeBatchId === batchId) {
        setActiveAdminBatch(updated);
      }
      setEditingId(null);
      setEditingName('');
      flashSuccess('Batch renamed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rename batch.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (batchId) => {
    if (!window.confirm('Delete this batch? Related records will be unassigned.')) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/batches/${batchId}`);
      setBatches((prev) => prev.filter((batch) => batch._id !== batchId));
      if (activeBatchId === batchId) {
        setActiveBatchId('');
        setActiveAdminBatch(null);
      }
      flashSuccess('Batch deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = (batch) => {
    setActiveBatchId(batch._id);
    setActiveAdminBatch(batch);
    flashSuccess(`Active batch set to ${batch.name}.`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-16 space-y-6">
      <PageHeader
        title="Batch Manager"
        description="Create, rename, delete, and select the batch that the admin panel should operate on."
        icon={Layers3}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2 border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold flex items-center gap-2 border border-green-100">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={newBatchName}
            onChange={(event) => setNewBatchName(event.target.value)}
            placeholder="e.g. Batch B"
            className="input-field flex-1"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="btn btn-primary px-6 py-3"
          >
            <Plus size={16} /> Create Batch
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="card text-slate-500 font-medium">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="card text-slate-500 font-medium">No batches have been created yet.</div>
        ) : (
          batches.map((batch) => (
            <div
              key={batch._id}
              className={`card flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 ${activeBatchId === batch._id ? 'border-lime' : 'border-transparent'}`}
            >
              <div className="min-w-0 flex-1">
                {editingId === batch._id ? (
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="input-field max-w-md"
                  />
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-navy">{batch.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{batch.slug}</p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => handleSetActive(batch)}
                  className={`btn px-4 py-3 ${activeBatchId === batch._id ? 'bg-lime text-white' : 'btn-primary'}`}
                >
                  Set Active
                </button>
                {editingId === batch._id ? (
                  <button
                    onClick={() => handleRename(batch._id)}
                    disabled={saving}
                    className="btn bg-green-50 text-green-700 px-4 py-3"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(batch)}
                    className="btn bg-slate-100 text-slate-700 px-4 py-3"
                  >
                    <Pencil size={16} /> Rename
                  </button>
                )}
                <button
                  onClick={() => handleDelete(batch._id)}
                  disabled={saving}
                  className="btn bg-red-50 text-red-600 px-4 py-3"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Batches;
