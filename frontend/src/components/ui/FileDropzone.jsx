import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { HiCloudArrowUp, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2';

export default function FileDropzone({
  onFileAccepted,
  acceptedTypes = {
    'text/csv': ['.csv'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
}) {
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError(null);
      setAccepted(null);

      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        if (err.code === 'file-too-large') {
          setError('File is too large. Maximum size is 50 MB.');
        } else if (err.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a CSV or Excel file.');
        } else {
          setError(err.message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setAccepted(file);
        onFileAccepted?.(file);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    multiple: false,
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center
          rounded-2xl border-2 border-dashed p-10 md:p-16
          cursor-pointer transition-all duration-200
          ${
            isDragActive && !isDragReject
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : isDragReject
              ? 'border-danger bg-danger/5'
              : error
              ? 'border-danger/50 bg-danger/5'
              : accepted
              ? 'border-accent bg-accent/5'
              : 'border-border bg-surface hover:border-primary/50 hover:bg-primary/[0.02]'
          }
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {accepted ? (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
              >
                <HiCheckCircle className="w-16 h-16 text-accent mb-4" />
              </motion.div>
              <p className="text-lg font-semibold text-text-primary">{accepted.name}</p>
              <p className="text-sm text-text-secondary mt-1">{formatSize(accepted.size)}</p>
              <p className="text-xs text-text-muted mt-3">Click or drop again to replace</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <HiExclamationCircle className="w-16 h-16 text-danger mb-4" />
              <p className="text-sm font-medium text-danger">{error}</p>
              <p className="text-xs text-text-muted mt-3">Click or drop a valid file to try again</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={isDragActive ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <HiCloudArrowUp className="w-16 h-16 text-text-muted mb-4" />
              </motion.div>
              <p className="text-lg font-semibold text-text-primary mb-1">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your dataset here'}
              </p>
              <p className="text-sm text-text-secondary">
                or click to browse • CSV, Excel files up to 50 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
