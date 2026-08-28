import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { visualization } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import ChartContainer from '../components/charts/ChartContainer';
import { HiChartPie, HiChartBar } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const CHART_TYPES = [
  'bar', 'line', 'pie', 'histogram', 'scatter',
  'box', 'count', 'violin', 'heatmap', 'pair', 'area', 'bubble',
];
const NO_X = ['heatmap', 'pair', 'column_types', 'missing_values', 'top_categories', 'numeric_distribution'];
const NO_Y = ['pie', 'histogram', 'count', 'heatmap', 'pair'];

export default function VisualizationPage() {
  const { sessionId, datasetInfo, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('plotly');
  const [currentChart, setCurrentChart] = useState(null);

  if (!isLoaded) {
    return (
      <EmptyState
        icon={HiChartPie}
        title="No Dataset Loaded"
        description="Upload a dataset to create visualizations."
        actionText="Upload Dataset"
        onAction={() => (window.location.href = '/upload')}
      />
    );
  }

  const columns = datasetInfo?.columns_list || [];

  const handleGenerate = async () => {
    if (!chartType) return toast.error('Select a chart type');
    if (!NO_X.includes(chartType) && !xCol) return toast.error('Select an X-Axis column');
    setLoading(true);
    try {
      const res = await visualization.generateChart(sessionId, {
        chart_type: chartType,
        x_column: xCol,
        y_column: yCol,
        title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        color_theme: theme,
        width: 900,
        height: 500,
      });
      setCurrentChart(res.chart_json);
      toast.success('Chart generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate chart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ── Controls sidebar ── */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-surface rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-text-primary">Chart Builder</h2>

        {/* Chart type grid */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Chart Type</label>
          <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
            {CHART_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setChartType(t); setXCol(''); setYCol(''); }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs capitalize transition ${
                  chartType === t
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-bg text-text-secondary hover:border-primary/40 hover:text-text-primary'
                }`}
              >
                <HiChartBar className="w-5 h-5 mb-1" />
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* X Axis */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">X-Axis</label>
          <select
            value={xCol}
            onChange={(e) => setXCol(e.target.value)}
            disabled={NO_X.includes(chartType)}
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-text-primary outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {NO_X.includes(chartType) ? (
              <option value="">Not required</option>
            ) : (
              <>
                <option value="">-- Select --</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </>
            )}
          </select>
        </div>

        {/* Y Axis */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Y-Axis (optional)</label>
          <select
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
            disabled={NO_Y.includes(chartType)}
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-text-primary outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {NO_Y.includes(chartType) ? (
              <option value="">Not required</option>
            ) : (
              <>
                <option value="">-- Select --</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </>
            )}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chart Title"
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-text-primary outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Color Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2.5 border border-border rounded-xl bg-bg text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="plotly">Default (Plotly)</option>
            <option value="plotly_dark">Dark Mode</option>
            <option value="ggplot2">ggplot2</option>
            <option value="seaborn">Seaborn</option>
            <option value="simple_white">Simple White</option>
          </select>
        </div>

        {/* Generate btn */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow hover:shadow-lg disabled:opacity-50 transition"
        >
          {loading ? 'Generating…' : 'Generate Chart'}
        </motion.button>
      </div>

      {/* ── Chart canvas ── */}
      <div className="flex-1 bg-surface rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        {currentChart ? (
          <div className="w-full h-full p-2">
            <ChartContainer data={currentChart} title={title || 'Generated Chart'} loading={loading} />
          </div>
        ) : (
          <div className="text-center px-8">
            <HiChartPie className="w-20 h-20 mx-auto text-text-muted opacity-40 mb-4" />
            <p className="text-text-secondary font-medium">Select a chart type and configure options</p>
            <p className="text-text-muted text-sm mt-1">Your chart will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
