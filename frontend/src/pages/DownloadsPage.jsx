import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { download } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import { HiDocumentArrowDown, HiTableCells, HiPhoto } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function DownloadsPage() {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loadingType, setLoadingType] = useState(null);

  if (!isLoaded) {
    return <EmptyState icon={<HiDocumentArrowDown className="w-16 h-16"/>} title="No Dataset Loaded" description="Upload a dataset to access downloads." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  const handleDownloadCSV = async () => {
    setLoadingType('csv');
    try {
      const blob = await download.downloadCSV(sessionId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cleaned_data.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("CSV downloaded");
    } catch (err) {
      toast.error("Failed to download CSV");
    } finally {
      setLoadingType(null);
    }
  };

  const handleDownloadExcel = async () => {
    setLoadingType('excel');
    try {
      const blob = await download.downloadExcel(sessionId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cleaned_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Excel downloaded");
    } catch (err) {
      toast.error("Failed to download Excel");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><HiDocumentArrowDown className="text-primary"/> Download Center</h1>
        <p className="text-slate-500 dark:text-slate-400">Download your cleaned data and generated assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-md transition">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-4">
            <HiTableCells className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Cleaned Dataset (CSV)</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4 flex-1">Download your cleaned dataset in CSV format, perfect for further analysis in Python, R, or other tools.</p>
          <div className="text-sm text-slate-400 mb-4">{datasetInfo.rows || 0} rows &bull; {datasetInfo.columns || 0} columns</div>
          <button onClick={handleDownloadCSV} disabled={loadingType !== null} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2">
            {loadingType === 'csv' ? 'Downloading...' : <><HiDocumentArrowDown /> Download CSV</>}
          </button>
        </motion.div>

        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: 0.1}} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-md transition">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mb-4">
            <HiTableCells className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Cleaned Dataset (Excel)</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4 flex-1">Download your cleaned dataset in Excel format, ideal for sharing with business stakeholders.</p>
          <div className="text-sm text-slate-400 mb-4">{datasetInfo.rows || 0} rows &bull; {datasetInfo.columns || 0} columns</div>
          <button onClick={handleDownloadExcel} disabled={loadingType !== null} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center gap-2">
            {loadingType === 'excel' ? 'Downloading...' : <><HiDocumentArrowDown /> Download Excel</>}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
