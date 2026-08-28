import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { reports } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import { HiDocumentText, HiDocumentArrowDown } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const FORMATS = [
  { id: 'pdf', label: 'PDF', desc: 'Best for printing & sharing' },
  { id: 'docx', label: 'DOCX', desc: 'Editable Word document' },
  { id: 'html', label: 'HTML', desc: 'Interactive web report' },
];

const SECTIONS = [
  { key: 'summary', label: 'Dataset Summary' },
  { key: 'cleaning', label: 'Cleaning Report' },
  { key: 'stats', label: 'Statistics' },
  { key: 'insights', label: 'AI Insights' },
];

export default function ReportsPage() {
  const { sessionId, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState({ summary: true, cleaning: true, stats: true, insights: true });

  if (!isLoaded) {
    return (
      <EmptyState
        icon={HiDocumentText}
        title="No Dataset Loaded"
        description="Upload a dataset to generate reports."
        actionText="Upload Dataset"
        onAction={() => (window.location.href = '/upload')}
      />
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    const selectedSections = Object.keys(sections).filter((k) => sections[k]);
    try {
      const res = await reports.generateReport(sessionId, format, selectedSections);

      let blobData;
      let mimeType;
      if (format === 'html') {
        blobData = typeof res === 'string' ? res : JSON.stringify(res);
        mimeType = 'text/html';
      } else {
        blobData = res.data;
        mimeType = format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      const url = window.URL.createObjectURL(new Blob([blobData], { type: mimeType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${sessionId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded!');
    } catch (err) {
      console.error('Report error:', err);
      toast.error(err.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (s) => setSections({ ...sections, [s]: !sections[s] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <HiDocumentText className="text-primary" /> Report Generator
        </h1>
        <p className="text-text-secondary text-sm mt-1">Create professional reports from your analysis.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Config panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-6"
        >
          {/* Format */}
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-3">Select Format</h2>
            <div className="grid grid-cols-3 gap-3">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`p-3 rounded-xl border-2 text-center transition ${
                    format === f.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-bg hover:border-primary/40'
                  }`}
                >
                  <HiDocumentText className={`w-7 h-7 mx-auto mb-1 ${format === f.id ? 'text-primary' : 'text-text-muted'}`} />
                  <span className={`text-sm font-bold block ${format === f.id ? 'text-primary' : 'text-text-primary'}`}>{f.label}</span>
                  <span className="text-xs text-text-muted">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-3">Include Sections</h2>
            <div className="space-y-2">
              {SECTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl hover:bg-bg transition">
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={() => toggleSection(key)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-text-primary text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <HiDocumentArrowDown className="w-5 h-5" />
                Generate &amp; Download
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Preview panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-bg rounded-2xl border border-border flex flex-col items-center justify-center p-8 text-center"
        >
          <HiDocumentText className="w-20 h-20 text-text-muted opacity-30 mb-4" />
          <h3 className="text-lg font-semibold text-text-primary">Ready to Generate</h3>
          <p className="mt-2 text-sm text-text-secondary max-w-xs">
            Configure your format and sections, then click Generate to create your report.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {Object.keys(sections)
              .filter((k) => sections[k])
              .map((k) => (
                <span key={k} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                  {k}
                </span>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
