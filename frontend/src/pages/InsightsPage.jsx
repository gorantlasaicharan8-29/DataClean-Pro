import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { insights, visualization } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ChartContainer from '../components/charts/ChartContainer';
import { HiLightBulb } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function InsightsPage() {
  const { sessionId, isLoaded } = useDataset();
  const [loading, setLoading] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);

  useEffect(() => {
    if (isLoaded && sessionId && !insightsData) {
      generateInsights();
    }
  }, [isLoaded, sessionId]);

  if (!isLoaded) {
    return <EmptyState icon={<HiLightBulb className="w-16 h-16"/>} title="No Dataset Loaded" description="Upload a dataset to generate AI insights." actionText="Upload Dataset" onAction={() => window.location.href='/upload'} />;
  }

  const generateInsights = async () => {
    setLoading(true);
    try {
      const [res, heatmap] = await Promise.all([
        insights.getInsights(sessionId),
        visualization.generateChart(sessionId, {
          chart_type: 'heatmap',
          x_column: '',
          title: 'Correlation Heatmap',
          color_theme: 'plotly',
          width: 800,
          height: 500,
        }).catch(() => null),
      ]);
      setInsightsData(res);
      if (heatmap?.chart_json) setHeatmapData(heatmap.chart_json);
    } catch (err) {
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const getBorderColor = (severity) => {
    if (severity === 'critical') return 'border-l-red-500';
    if (severity === 'warning') return 'border-l-amber-500';
    return 'border-l-blue-500';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HiLightBulb className="text-amber-400"/> AI-Powered Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Automatically generated analysis of your dataset</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:opacity-90 font-medium transition"
        >
          {loading ? 'Analyzing...' : insightsData ? 'Refresh Insights' : 'Generate Insights'}
        </button>
      </div>

      {loading && <LoadingSpinner size="lg" text="Analyzing data and generating insights..." />}

      {insightsData && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <motion.div
            initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Business Summary</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{insightsData.summary}</p>
          </motion.div>

          {/* Key findings grid */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-8 mb-4">Key Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insightsData.insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: idx * 0.05}}
                className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 ${getBorderColor(insight.severity)} flex gap-4 items-start`}
              >
                <div className="text-2xl">{insight.icon}</div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">{insight.category}</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{insight.message}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Correlation heatmap — rendered as real Plotly chart */}
          {heatmapData && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Correlation Heatmap</h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <ChartContainer data={heatmapData} title="Correlation Heatmap" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
