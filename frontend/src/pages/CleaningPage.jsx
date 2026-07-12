import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { cleaning, preview } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DataTable from '../components/tables/DataTable';
import { HiWrenchScrewdriver, HiSparkles } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function CleaningPage() {
  const { sessionId, datasetInfo, isLoaded, updateInfo } = useDataset();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isLoaded && sessionId) {
      loadData();
    }
  }, [isLoaded, sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const summ = await cleaning.getSummary(sessionId);
      const prev = await preview.getPreview(sessionId);
      setSummary(summ);
      setPreviewData(prev);
    } catch (err) {
      toast.error('Failed to load cleaning data');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoClean = async () => {
    setLoading(true);
    try {
      const res = await cleaning.autoClean(sessionId);
      toast.success('Auto clean successful');
      setLogs(prev => [...prev, ...res.operations_applied]);
      const prev = await preview.getPreview(sessionId);
      setPreviewData(prev);
      updateInfo(prev.info);
    } catch (err) {
      toast.error('Auto clean failed');
    } finally {
      setLoading(false);
    }
  };

  const applySingleOp = async (op) => {
    setLoading(true);
    try {
      const res = await cleaning.applyOperations(sessionId, [op]);
      toast.success('Operation applied');
      setLogs(prev => [...prev, ...res.operations_applied]);
      const prev = await preview.getPreview(sessionId);
      setPreviewData(prev);
      updateInfo(prev.info);
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <EmptyState icon={<HiWrenchScrewdriver className="w-16 h-16"/>} title="No Dataset Loaded" description="Upload a dataset to start cleaning." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  if (loading && !previewData) {
    return <LoadingSpinner size="lg" text="Loading cleaning tools..." />;
  }

  const columns = datasetInfo?.columns_list?.map(col => ({ key: col, label: col })) || [];

  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <button onClick={handleAutoClean} disabled={loading} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow font-semibold text-lg flex justify-center items-center gap-2 hover:opacity-90 transition">
          <HiSparkles className="w-6 h-6" /> Auto Clean
        </button>
        
        <div className="flex items-center gap-2 text-slate-500 my-2">
          <div className="h-px bg-slate-300 flex-1"></div>
          <span>or choose manually</span>
          <div className="h-px bg-slate-300 flex-1"></div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Duplicates</h3>
          <button onClick={() => applySingleOp({type: 'remove_duplicates'})} className="w-full py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition text-slate-700 dark:text-slate-200">
            Remove Duplicate Rows
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Null Handling</h3>
          <button onClick={() => applySingleOp({type: 'remove_empty_rows'})} className="w-full py-2 mb-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition text-slate-700 dark:text-slate-200">
            Remove Empty Rows
          </button>
          <button onClick={() => applySingleOp({type: 'normalize_column_names'})} className="w-full py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition text-slate-700 dark:text-slate-200">
            Normalize Column Names
          </button>
        </div>
      </div>

      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {loading && <LoadingSpinner size="sm" text="Applying..." />}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Cleaning Log</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 max-h-32 overflow-y-auto">
            {logs.length === 0 ? <li>No operations applied yet.</li> : logs.map((log, i) => <li key={i}>✓ {log}</li>)}
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white">Live Preview</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
            {previewData && <DataTable data={previewData.head} columns={columns} pageSize={10} />}
          </div>
        </div>
      </div>
    </div>
  );
}
