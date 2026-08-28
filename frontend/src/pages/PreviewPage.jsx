import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { preview } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DataTable from '../components/tables/DataTable';
import { HiTableCells } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function PreviewPage({ dataType = 'raw' }) {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('first');
  const [previewData, setPreviewData] = useState(null);
  const [colStats, setColStats] = useState(null);

  useEffect(() => {
    if (isLoaded && sessionId) fetchData();
  }, [isLoaded, sessionId, dataType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prev, cols] = await Promise.all([
        preview.getPreview(sessionId, dataType),
        preview.getColumnStats(sessionId, dataType),
      ]);
      setPreviewData(prev);
      setColStats(cols?.columns || []);
    } catch (err) {
      toast.error(`Failed to load preview: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <EmptyState
        icon={HiTableCells}
        title="No Dataset Loaded"
        description="Upload a dataset first to see the preview."
        actionText="Upload Dataset"
        onAction={() => (window.location.href = '/upload')}
      />
    );
  }

  if (loading || !previewData || !colStats) {
    return <LoadingSpinner size="lg" text="Loading preview…" />;
  }

  const columnList = previewData?.info?.columns_list || (previewData?.head?.[0] ? Object.keys(previewData.head[0]) : []);
  const columns = columnList.map((col) => ({ key: col, label: col }));

  const TABS = [
    { id: 'first', label: 'First 20 Rows' },
    { id: 'last', label: 'Last 20 Rows' },
    { id: 'info', label: 'Column Info' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">
          {dataType === 'cleaned' ? 'Cleaned Dataset Preview' : 'Dataset Preview'}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {datasetInfo?.filename} &bull; {previewData?.info?.shape?.[0] || 0} rows &times; {previewData?.info?.shape?.[1] || 0} cols
          {previewData?.info?.memory_usage ? ` • ${previewData.info.memory_usage}` : ''}
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        {activeTab === 'first' && (
          <DataTable data={previewData?.head || []} columns={columns} pageSize={20} />
        )}
        {activeTab === 'last' && (
          <DataTable data={previewData?.tail || []} columns={columns} pageSize={20} />
        )}
        {activeTab === 'info' && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colStats.map((col) => (
              <div key={col.name} className="p-4 border border-border rounded-xl bg-bg">
                <h3 className="font-semibold text-text-primary truncate mb-2">{col.name}</h3>
                <div className="space-y-1 text-sm text-text-secondary">
                  <p>
                    Type:{' '}
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {col.dtype}
                    </span>
                  </p>
                  <p>
                    Missing:{' '}
                    <span className={col.missing > 0 ? 'text-danger font-semibold' : 'text-accent'}>
                      {col.missing}
                    </span>
                  </p>
                  <p>Unique: <span className="text-text-primary font-medium">{col.unique}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
