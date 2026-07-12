import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { preview } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DataTable from '../components/tables/DataTable';
import { HiTableCells } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function PreviewPage({ dataType = 'raw' }) {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('first');
  const [previewData, setPreviewData] = useState(null);
  const [colStats, setColStats] = useState(null);

  useEffect(() => {
    if (isLoaded && sessionId) {
      fetchData();
    }
  }, [isLoaded, sessionId, dataType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prev = await preview.getPreview(sessionId, dataType);
      const cols = await preview.getColumnStats(sessionId, dataType);
      setPreviewData(prev);
      setColStats(cols.columns);
    } catch (err) {
      toast.error(`Failed to load preview data: ${err.message || err.response?.data?.detail}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <EmptyState
        icon={<HiTableCells className="w-16 h-16" />}
        title="No Dataset Loaded"
        description="Upload a dataset first to see the preview."
        actionText="Upload Dataset"
        onAction={() => window.location.href = '/upload'}
      />
    );
  }

  if (loading || !previewData || !colStats) {
    return <LoadingSpinner size="lg" text="Loading preview..." />;
  }

  const columns = previewData.info.columns_list.map(col => ({ key: col, label: col }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {dataType === 'cleaned' ? 'Cleaned Dataset Preview' : 'Dataset Preview'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {datasetInfo.filename} &bull; {previewData.info.shape[0]} rows x {previewData.info.shape[1]} cols &bull; {previewData.info.memory_usage}
          </p>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'first' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          onClick={() => setActiveTab('first')}
        >
          First 20 Rows
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'last' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          onClick={() => setActiveTab('last')}
        >
          Last 20 Rows
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'info' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          onClick={() => setActiveTab('info')}
        >
          Column Info
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {activeTab === 'first' && (
          <DataTable data={previewData.head} columns={columns} pageSize={10} />
        )}
        {activeTab === 'last' && (
          <DataTable data={previewData.tail} columns={columns} pageSize={10} />
        )}
        {activeTab === 'info' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colStats.map(col => (
              <div key={col.name} className="p-4 border rounded-lg dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">{col.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <p>Type: <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{col.dtype}</span></p>
                  <p>Missing: <span className={col.missing > 0 ? 'text-red-500 font-medium' : ''}>{col.missing}</span></p>
                  <p>Unique: {col.unique}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
