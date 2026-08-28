import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { download } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import { HiDocumentArrowDown, HiTableCells } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function DownloadsPage() {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loadingType, setLoadingType] = useState(null);

  if (!isLoaded) {
    return (
      <EmptyState
        icon={HiDocumentArrowDown}
        title="No Dataset Loaded"
        description="Upload a dataset to access downloads."
        actionText="Upload Dataset"
        onAction={() => (window.location.href = '/upload')}
      />
    );
  }

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = async () => {
    setLoadingType('csv');
    try {
      const res = await download.downloadCSV(sessionId);
      triggerDownload(res.data, 'cleaned_data.csv');
      toast.success('CSV downloaded!');
    } catch {
      toast.error('Failed to download CSV');
    } finally {
      setLoadingType(null);
    }
  };

  const handleDownloadExcel = async () => {
    setLoadingType('excel');
    try {
      const res = await download.downloadExcel(sessionId);
      triggerDownload(res.data, 'cleaned_data.xlsx');
      toast.success('Excel downloaded!');
    } catch {
      toast.error('Failed to download Excel');
    } finally {
      setLoadingType(null);
    }
  };

  const DOWNLOADS = [
    {
      id: 'csv',
      label: 'Cleaned Dataset (CSV)',
      desc: 'Universal format for Python, R, and other tools.',
      icon: HiTableCells,
      accentBg: 'bg-blue-500/10',
      accentText: 'text-blue-500',
      handler: handleDownloadCSV,
    },
    {
      id: 'excel',
      label: 'Cleaned Dataset (Excel)',
      desc: 'Ideal for stakeholders and business reporting.',
      icon: HiTableCells,
      accentBg: 'bg-emerald-500/10',
      accentText: 'text-emerald-500',
      handler: handleDownloadExcel,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <HiDocumentArrowDown className="text-primary" /> Download Center
        </h1>
        <p className="text-text-secondary text-sm mt-1">Download your cleaned dataset in various formats.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOWNLOADS.map(({ id, label, desc, icon: Icon, accentBg, accentText, handler }, idx) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.07 }}
            className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col hover:shadow-md transition"
          >
            <div className={`w-12 h-12 rounded-xl ${accentBg} flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${accentText}`} />
            </div>
            <h2 className="text-base font-bold text-text-primary mb-1">{label}</h2>
            <p className="text-text-secondary text-sm mb-3 flex-1">{desc}</p>
            <p className="text-text-muted text-xs mb-4">
              {datasetInfo?.rows || 0} rows &bull; {datasetInfo?.columns || 0} columns
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handler}
              disabled={loadingType !== null}
              className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition"
            >
              {loadingType === id ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading…
                </>
              ) : (
                <>
                  <HiDocumentArrowDown className="w-4 h-4" />
                  Download {id.toUpperCase()}
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
