import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { visualization } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import ChartContainer from '../components/charts/ChartContainer';
import { HiChartPie, HiChartBar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

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
    return <EmptyState icon={<HiChartPie className="w-16 h-16"/>} title="No Dataset Loaded" description="Upload a dataset to create visualizations." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  const columns = datasetInfo?.columns_list || [];
  
  const chartTypes = ['bar', 'line', 'pie', 'histogram', 'scatter', 'box', 'count', 'violin', 'heatmap', 'pair', 'area', 'bubble'];

  const handleGenerate = async () => {
    if (!chartType) return toast.error("Select a chart type");
    if (!xCol && !['heatmap', 'pair'].includes(chartType)) return toast.error("Select X-Axis column");
    
    setLoading(true);
    try {
      const res = await visualization.generateChart(sessionId, {
        chart_type: chartType,
        x_column: xCol,
        y_column: yCol,
        title: title || `${chartType.toUpperCase()} Chart`,
        color_theme: theme,
        width: 800,
        height: 500
      });
      setCurrentChart(res.chart_json);
      toast.success("Chart generated");
    } catch (err) {
      toast.error("Failed to generate chart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-80 flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Chart Builder</h2>
        
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chart Type</label>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 shrink-0 min-h-[120px]">
          {chartTypes.map(t => (
            <div key={t} onClick={() => setChartType(t)} className={`flex flex-col items-center justify-center p-2 rounded border cursor-pointer ${chartType === t ? 'border-primary bg-blue-50 text-primary dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <HiChartBar className="w-6 h-6 mb-1" />
              <span className="text-xs capitalize">{t}</span>
            </div>
          ))}
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">X-Axis</label>
        <select 
          value={xCol} 
          onChange={(e) => setXCol(e.target.value)} 
          disabled={['heatmap', 'pair'].includes(chartType)}
          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {['heatmap', 'pair'].includes(chartType) ? (
            <option value="">Not required for this chart</option>
          ) : (
            <>
              <option value="">-- Select --</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </>
          )}
        </select>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Y-Axis</label>
        <select 
          value={yCol} 
          onChange={(e) => setYCol(e.target.value)} 
          disabled={['pie', 'histogram', 'count', 'heatmap', 'pair'].includes(chartType)}
          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {['pie', 'histogram', 'count', 'heatmap', 'pair'].includes(chartType) ? (
            <option value="">Not required for this chart</option>
          ) : (
            <>
              <option value="">-- Select --</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </>
          )}
        </select>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title (Optional)</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none" placeholder="Chart Title" />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none">
          <option value="plotly">Default (Plotly)</option>
          <option value="plotly_dark">Dark Mode</option>
          <option value="ggplot2">ggplot2</option>
          <option value="seaborn">Seaborn</option>
          <option value="simple_white">Simple White</option>
        </select>

        <button onClick={handleGenerate} disabled={loading} className="w-full mt-4 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg hover:opacity-90 font-medium transition">
          {loading ? 'Generating...' : 'Generate Chart'}
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4">
        {currentChart ? (
          <div className="w-full h-full flex flex-col">
            <ChartContainer data={currentChart} title={title || 'Generated Chart'} loading={loading} />
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <HiChartPie className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select a chart type and configure options to generate a visualization</p>
          </div>
        )}
      </div>
    </div>
  );
}
