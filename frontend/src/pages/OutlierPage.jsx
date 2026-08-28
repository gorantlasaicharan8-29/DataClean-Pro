import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { outliers } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ChartContainer from '../components/charts/ChartContainer';
import { HiExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function OutlierPage() {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('iqr');
  const [column, setColumn] = useState('');
  const [threshold, setThreshold] = useState(1.5);
  const [results, setResults] = useState(null);

  if (!isLoaded) {
    return <EmptyState icon={HiExclamationTriangle} title="No Dataset Loaded" description="Upload a dataset to detect outliers." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  const numericColumns = datasetInfo?.columns_list?.filter(col => {
    const t = datasetInfo?.dtypes?.[col];
    return t && (t.includes('int') || t.includes('float'));
  }) || [];

  const handleDetect = async () => {
    if (!column) return toast.error("Select a column first");
    setLoading(true);
    try {
      const res = await outliers.detect(sessionId, column, method, parseFloat(threshold));
      setResults(res);
      toast.success("Detection complete");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Detection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await outliers.remove(sessionId, column, method, parseFloat(threshold));
      toast.success("Outliers removed");
      setResults(null);
    } catch (err) {
      toast.error("Removal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <HiExclamationTriangle className="text-warning" /> Outlier Detection
        </h1>
        <p className="text-text-secondary text-sm mt-1">Detect and remove statistical outliers from numeric columns.</p>
      </motion.div>

      {/* Method selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-surface rounded-2xl border border-border p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold text-text-primary mb-4">Detection Method</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div
            onClick={() => { setMethod('iqr'); setThreshold(1.5); }}
            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition ${method === 'iqr' ? 'border-primary bg-primary/5' : 'border-border bg-bg hover:border-primary/40'}`}
          >
            <h3 className="font-semibold text-text-primary">IQR Method</h3>
            <p className="text-sm text-text-secondary mt-1">Robust to extreme values (Default: 1.5×IQR)</p>
          </div>
          <div
            onClick={() => { setMethod('zscore'); setThreshold(3.0); }}
            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition ${method === 'zscore' ? 'border-primary bg-primary/5' : 'border-border bg-bg hover:border-primary/40'}`}
          >
            <h3 className="font-semibold text-text-primary">Z-Score Method</h3>
            <p className="text-sm text-text-secondary mt-1">Best for normally distributed data (Default: 3.0σ)</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-1">Select Column</label>
            <select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              className="w-full p-2.5 border border-border rounded-xl bg-bg text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">-- Select a numeric column --</option>
              {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-1">Threshold</label>
            <input
              type="number"
              step="0.1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full p-2.5 border border-border rounded-xl bg-bg text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleDetect}
            disabled={loading || !column}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow hover:shadow-lg disabled:opacity-50 transition"
          >
            {loading ? 'Detecting…' : 'Detect Outliers'}
          </motion.button>
        </div>
      </motion.div>

      {loading && <LoadingSpinner size="lg" text="Analyzing…" />}

      {results && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary bar */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Found <span className="text-warning">{results.outlier_count}</span> Outliers
              </h3>
              <p className="text-text-secondary text-sm">In column <strong>{results.column}</strong> using {results.method?.toUpperCase()}</p>
            </div>
            {results.outlier_count > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleRemove}
                className="px-5 py-2 bg-gradient-to-r from-danger to-rose-600 text-white rounded-xl font-semibold shadow hover:shadow-lg transition"
              >
                Remove Outliers
              </motion.button>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartContainer data={results.box_plot_data} title="Box Plot" />
            <ChartContainer data={results.distribution_data} title="Distribution Plot" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
