import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  HiTableCells,
  HiViewColumns,
  HiExclamationCircle,
  HiDocumentDuplicate,
  HiExclamationTriangle,
  HiCheckCircle,
  HiShieldCheck,
  HiCloudArrowUp,
  HiBeaker,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useDataset } from '../context/DatasetContext';
import { upload as uploadApi, visualization } from '../services/api';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ChartContainer from '../components/charts/ChartContainer';

const STAT_CARDS = [
  { key: 'rows', label: 'Total Rows', field: 'rows', gradient: 'from-blue-500 to-blue-600', icon: HiTableCells },
  { key: 'columns', label: 'Total Columns', field: 'columns', gradient: 'from-indigo-500 to-indigo-600', icon: HiViewColumns },
  { key: 'missing', label: 'Missing Values', field: 'missing_values', gradient: 'from-amber-500 to-amber-600', icon: HiExclamationCircle },
  { key: 'duplicates', label: 'Duplicate Rows', field: 'duplicates', gradient: 'from-rose-500 to-rose-600', icon: HiDocumentDuplicate },
  { key: 'outliers', label: 'Outliers Found', field: 'outliers', gradient: 'from-orange-500 to-orange-600', icon: HiExclamationTriangle, fallback: 0 },
  { key: 'cleaning', label: 'Cleaning Status', field: 'cleaning_pct', gradient: 'from-emerald-500 to-emerald-600', icon: HiCheckCircle, suffix: '%', fallback: 0 },
  { key: 'quality', label: 'Data Quality Score', field: 'quality_score', gradient: 'from-violet-500 to-violet-600', icon: HiShieldCheck, suffix: '%' },
];

const CHART_CONFIGS = [
  { type: 'pie', title: 'Column Types Distribution', config: { chart_type: 'column_types' } },
  { type: 'bar', title: 'Missing Values per Column', config: { chart_type: 'missing_values' } },
  { type: 'bar', title: 'Top Categories', config: { chart_type: 'top_categories' } },
  { type: 'histogram', title: 'Numeric Distribution', config: { chart_type: 'numeric_distribution' } },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessionId, datasetInfo, isLoaded, setSession, setLoading: setDatasetLoading } = useDataset();
  const [charts, setCharts] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Compute quality score if not provided
  const qualityScore = (() => {
    if (datasetInfo?.quality_score != null) return datasetInfo.quality_score;
    if (!datasetInfo) return 0;
    const totalCells = (datasetInfo.rows || 1) * (datasetInfo.columns || 1);
    const missingPct = ((datasetInfo.missing_values || 0) / totalCells) * 100;
    const dupPct = ((datasetInfo.duplicates || 0) / (datasetInfo.rows || 1)) * 100;
    return Math.max(0, Math.round(100 - missingPct - dupPct));
  })();

  const enrichedInfo = {
    ...datasetInfo,
    quality_score: qualityScore,
    cleaning_pct: datasetInfo?.cleaning_pct ?? 0,
    outliers: datasetInfo?.outliers ?? 0,
  };

  // Fetch charts when dataset is loaded
  useEffect(() => {
    if (!isLoaded || !sessionId) return;

    const fetchCharts = async () => {
      setChartsLoading(true);
      const results = [];
      for (const cfg of CHART_CONFIGS) {
        try {
          const res = await visualization.generateChart(sessionId, cfg.config);
          results.push({ title: cfg.title, data: res.chart_json });
        } catch {
          results.push({ title: cfg.title, data: null });
        }
      }
      setCharts(results);
      setChartsLoading(false);
    };

    fetchCharts();
  }, [isLoaded, sessionId]);

  const handleLoadSample = async () => {
    setSampleLoading(true);
    try {
      const res = await uploadApi.loadSampleData();
      const { session_id, ...info } = res;
      setSession(session_id, info);
      toast.success('Sample dataset loaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to load sample data');
    } finally {
      setSampleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Welcome back, {user?.name || 'User'} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">{today}</p>
      </motion.div>

      {!isLoaded ? (
        /* ─── No dataset loaded ─── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border p-8 md:p-12"
        >
          <EmptyState
            icon={HiCloudArrowUp}
            title="No Dataset Loaded"
            description="Upload a CSV or Excel file to get started with cleaning, analysis, and visualizations."
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <HiCloudArrowUp className="w-5 h-5" />
              Upload Dataset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLoadSample}
              disabled={sampleLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-emerald-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition-shadow"
            >
              {sampleLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <HiBeaker className="w-5 h-5" />
                  Load Sample Dataset
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* ─── Dataset loaded ─── */
        <>
          {/* Stat cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((card, idx) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <StatCard
                  title={card.label}
                  value={enrichedInfo?.[card.field] ?? card.fallback ?? 0}
                  icon={card.icon}
                  gradient={card.gradient}
                  suffix={card.suffix || ''}
                  prefix={card.prefix || ''}
                />
              </motion.div>
            ))}
          </div>

          {/* Dataset info bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 bg-surface border border-border rounded-xl px-5 py-3 text-sm"
          >
            <span className="font-medium text-text-primary">
              📄 {datasetInfo?.filename || 'Dataset'}
            </span>
            {datasetInfo?.uploadTime && (
              <span className="text-text-muted">
                Uploaded {new Date(datasetInfo.uploadTime).toLocaleString()}
              </span>
            )}
          </motion.div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {chartsLoading
              ? CHART_CONFIGS.map((cfg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                  >
                    <ChartContainer title={cfg.title} loading={true} />
                  </motion.div>
                ))
              : charts.map((chart, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                  >
                    <ChartContainer title={chart.title} data={chart.data} />
                  </motion.div>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
