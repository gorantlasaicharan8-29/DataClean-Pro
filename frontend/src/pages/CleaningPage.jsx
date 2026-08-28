import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { cleaning, preview } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DataTable from '../components/tables/DataTable';
import { HiWrenchScrewdriver, HiSparkles, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function CleaningPage() {
  const { sessionId, datasetInfo, isLoaded, updateInfo } = useDataset();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isLoaded && sessionId) loadData();
  }, [isLoaded, sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const prev = await preview.getPreview(sessionId);
      setPreviewData(prev);
    } catch {
      toast.error('Failed to load preview data');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoClean = async () => {
    setLoading(true);
    try {
      const res = await cleaning.autoClean(sessionId);
      toast.success('Auto clean successful!');
      setLogs((prev) => [...prev, ...(res.operations_applied || [])]);
      const prev = await preview.getPreview(sessionId);
      setPreviewData(prev);
      if (prev.info) updateInfo(prev.info);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Auto clean failed');
    } finally {
      setLoading(false);
    }
  };

  const applySingleOp = async (op) => {
    setLoading(true);
    try {
      const res = await cleaning.applyOperations(sessionId, [op]);
      toast.success('Operation applied!');
      setLogs((prev) => [...prev, ...(res.operations_applied || [])]);
      const prev = await preview.getPreview(sessionId);
      setPreviewData(prev);
      if (prev.info) updateInfo(prev.info);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <EmptyState
        icon={HiWrenchScrewdriver}
        title="No Dataset Loaded"
        description="Upload a dataset to start cleaning."
        actionText="Upload Dataset"
        onAction={() => (window.location.href = '/upload')}
      />
    );
  }

  if (loading && !previewData) {
    return <LoadingSpinner size="lg" text="Loading cleaning tools…" />;
  }

  const columns = datasetInfo?.columns_list?.map((col) => ({ key: col, label: col })) || [];

  const OPS = [
    { label: 'Remove Duplicate Rows', op: { type: 'remove_duplicates' } },
    { label: 'Remove Empty Rows', op: { type: 'remove_empty_rows' } },
    { label: 'Normalize Column Names', op: { type: 'normalize_column_names' } },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <HiWrenchScrewdriver className="text-primary" /> Data Cleaning
        </h1>
        <p className="text-text-secondary text-sm mt-1">Clean and prepare your dataset for analysis.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Controls */}
        <div className="w-full md:w-72 space-y-4 flex-shrink-0">
          {/* Auto clean */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleAutoClean}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-accent to-emerald-600 text-white rounded-2xl shadow-lg font-bold text-base flex justify-center items-center gap-2 hover:shadow-xl disabled:opacity-60 transition"
          >
            <HiSparkles className="w-5 h-5" /> Auto Clean Everything
          </motion.button>

          <div className="flex items-center gap-2 text-text-muted">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs">or apply manually</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Manual ops */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-2"
          >
            <h3 className="font-semibold text-text-primary mb-3">Operations</h3>
            {OPS.map(({ label, op }) => (
              <button
                key={op.type}
                onClick={() => applySingleOp(op)}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-bg border border-border rounded-xl text-text-primary text-sm font-medium hover:bg-primary/5 hover:border-primary/40 transition text-left disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Cleaning log */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl border border-border p-4 shadow-sm"
          >
            <h3 className="font-semibold text-text-primary mb-2">Cleaning Log</h3>
            <ul className="text-sm text-text-secondary space-y-1 max-h-36 overflow-y-auto">
              {logs.length === 0 ? (
                <li className="text-text-muted italic">No operations applied yet.</li>
              ) : (
                logs.map((log, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <HiCheckCircle className="text-accent w-4 h-4 mt-0.5 flex-shrink-0" />
                    {log}
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </div>

        {/* Live preview */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex-1 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Live Preview</h3>
            {loading && <span className="text-xs text-text-muted animate-pulse">Updating…</span>}
          </div>
          <div className="min-h-[300px]">
            {previewData ? (
              <DataTable data={previewData.head} columns={columns} pageSize={10} />
            ) : (
              <LoadingSpinner size="md" text="Loading preview…" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
