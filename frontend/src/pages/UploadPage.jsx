import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HiCheckCircle, HiTableCells, HiViewColumns, HiClock, HiDocument, HiBeaker, HiArrowRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useDataset } from '../context/DatasetContext';
import { upload as uploadApi } from '../services/api';
import FileDropzone from '../components/ui/FileDropzone';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function UploadPage() {
  const navigate = useNavigate();
  const { setSession } = useDataset();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  const handleFileAccepted = async (file) => {
    setUploading(true);
    setUploadResult(null);

    try {
      const res = await uploadApi.uploadFile(file);
      const { session_id, ...info } = res;
      const enrichedInfo = {
        ...info,
        filename: file.name,
        fileSize: file.size,
        uploadTime: new Date().toISOString(),
      };
      setSession(session_id, enrichedInfo);
      setUploadResult(enrichedInfo);
      toast.success('Dataset uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setSampleLoading(true);
    setUploadResult(null);

    try {
      const res = await uploadApi.loadSampleData();
      const { session_id, ...info } = res;
      const enrichedInfo = {
        ...info,
        filename: info.filename || 'sample_data.csv',
        uploadTime: new Date().toISOString(),
      };
      setSession(session_id, enrichedInfo);
      setUploadResult(enrichedInfo);
      toast.success('Sample dataset loaded!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load sample data.');
    } finally {
      setSampleLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">Upload Dataset</h1>
        <p className="text-text-secondary text-sm mt-1">
          Upload a CSV or Excel file to start cleaning and visualizing your data.
        </p>
      </motion.div>

      {/* Dropzone */}
      {!uploading && !uploadResult && (
        <FileDropzone onFileAccepted={handleFileAccepted} />
      )}

      {/* Uploading spinner */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface rounded-2xl border border-border p-12"
        >
          <LoadingSpinner size="lg" text="Uploading and analyzing your dataset..." />
        </motion.div>
      )}

      {/* Upload success */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-surface rounded-2xl border border-border overflow-hidden"
          >
            {/* Success header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
              <div className="flex items-center gap-3 text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
                >
                  <HiCheckCircle className="w-10 h-10" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold">Upload Successful!</h2>
                  <p className="text-emerald-100 text-sm">Your dataset is ready for analysis.</p>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              <MetaItem icon={HiDocument} label="Filename" value={uploadResult.filename} />
              <MetaItem icon={HiDocument} label="File Size" value={formatSize(uploadResult.fileSize)} />
              <MetaItem icon={HiTableCells} label="Rows" value={(uploadResult.rows ?? 0).toLocaleString()} />
              <MetaItem icon={HiViewColumns} label="Columns" value={(uploadResult.columns ?? 0).toLocaleString()} />
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/preview')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
              >
                Continue to Preview
                <HiArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-text-primary font-semibold text-sm hover:bg-bg transition-colors"
              >
                Go to Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load sample section */}
      {!uploadResult && !uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl border border-border p-6 text-center"
        >
          <HiBeaker className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-secondary mb-4">
            Don't have a file? Try our built-in sample dataset to explore all features.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLoadSample}
            disabled={sampleLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-emerald-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 transition-shadow"
          >
            {sampleLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <HiBeaker className="w-4 h-4" />
                Load Sample Dataset
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-text-secondary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
