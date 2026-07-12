import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { outliers } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ChartContainer from '../components/charts/ChartContainer';
import { HiExclamationTriangle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function OutlierPage() {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('iqr');
  const [column, setColumn] = useState('');
  const [threshold, setThreshold] = useState(1.5);
  const [results, setResults] = useState(null);

  if (!isLoaded) {
    return <EmptyState icon={<HiExclamationTriangle className="w-16 h-16"/>} title="No Dataset Loaded" description="Upload a dataset to detect outliers." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  const numericColumns = datasetInfo?.columns_list?.filter(col => {
    const t = datasetInfo.dtypes[col];
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
      toast.error("Detection failed");
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
    <div className="p-6 flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Detect Outliers</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className={`flex-1 p-4 rounded-xl border cursor-pointer transition ${method === 'iqr' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`} onClick={() => {setMethod('iqr'); setThreshold(1.5);}}>
            <h3 className="font-semibold text-slate-800 dark:text-white">IQR Method</h3>
            <p className="text-sm text-slate-500">Robust to extreme values (Default: 1.5)</p>
          </div>
          <div className={`flex-1 p-4 rounded-xl border cursor-pointer transition ${method === 'zscore' ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`} onClick={() => {setMethod('zscore'); setThreshold(3.0);}}>
            <h3 className="font-semibold text-slate-800 dark:text-white">Z-Score Method</h3>
            <p className="text-sm text-slate-500">Best for normally distributed data (Default: 3.0)</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Column</label>
            <select value={column} onChange={(e) => setColumn(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none">
              <option value="">-- Select --</option>
              {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Threshold</label>
            <input type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none" />
          </div>
          <button onClick={handleDetect} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 font-medium transition">
            {loading ? 'Detecting...' : 'Detect Outliers'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner size="lg" text="Analyzing..." />}

      {results && !loading && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Found {results.outlier_count} Outliers</h3>
              <p className="text-slate-500 dark:text-slate-400">In column {results.column} using {results.method.toUpperCase()}</p>
            </div>
            {results.outlier_count > 0 && (
              <button onClick={handleRemove} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">
                Remove Outliers
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer data={results.box_plot_data} title="Box Plot" />
            <ChartContainer data={results.distribution_data} title="Distribution Plot" />
          </div>
        </div>
      )}
    </div>
  );
}
