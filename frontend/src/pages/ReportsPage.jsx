import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { reports } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import { HiDocumentText, HiDocumentArrowDown } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { sessionId, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({
    summary: true,
    cleaning: true,
    stats: true,
    insights: true
  });

  if (!isLoaded) {
    return <EmptyState icon={<HiDocumentText className="w-16 h-16"/>} title="No Dataset Loaded" description="Upload a dataset to generate reports." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  const handleGenerate = async () => {
    setLoading(true);
    const selectedSections = Object.keys(sections).filter(k => sections[k]);
    try {
      const blob = await reports.generateReport(sessionId, format, selectedSections);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${sessionId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success("Report generated and downloaded");
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (s) => setSections({...sections, [s]: !sections[s]});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Report Generator</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Create comprehensive professional reports from your analysis.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Select Format</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {['pdf', 'docx', 'html'].map(f => (
              <div key={f} onClick={() => setFormat(f)} className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center justify-center transition ${format === f ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                <HiDocumentText className="w-8 h-8 mb-2" />
                <span className="font-semibold uppercase">{f}</span>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Include Sections</h2>
          <div className="space-y-3 mb-8">
            {Object.keys(sections).map(k => (
              <label key={k} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={sections[k]} onChange={() => toggleSection(k)} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-slate-700 dark:text-slate-300 capitalize">{k}</span>
              </label>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 font-medium transition flex items-center justify-center gap-2">
            {loading ? 'Generating...' : <><HiDocumentArrowDown className="w-5 h-5" /> Generate Report</>}
          </button>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <HiDocumentText className="w-24 h-24 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400">Ready to Generate</h3>
          <p className="mt-2 max-w-sm">Select your preferred format and sections, then click Generate to create your customized report.</p>
        </div>
      </div>
    </div>
  );
}
