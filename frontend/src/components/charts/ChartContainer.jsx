import { useState } from 'react';
import { motion } from 'motion/react';
import { HiArrowDownTray, HiArrowsPointingOut, HiArrowsPointingIn } from 'react-icons/hi2';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

const Plot = createPlotlyComponent(Plotly);

export default function ChartContainer({ data, title, loading = false, onDownload, onFullscreen }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen((p) => !p);
    onFullscreen?.(!isFullscreen);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  const chartLayout = {
    ...(data?.layout || {}),
    autosize: true,
    margin: { l: 50, r: 30, t: 40, b: 50, pad: 4 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: "'Inter', sans-serif",
      size: 12,
      color: '#64748B',
    },
    xaxis: {
      ...(data?.layout?.xaxis || {}),
      gridcolor: '#E2E8F0',
      zerolinecolor: '#E2E8F0',
    },
    yaxis: {
      ...(data?.layout?.yaxis || {}),
      gridcolor: '#E2E8F0',
      zerolinecolor: '#E2E8F0',
    },
    legend: {
      ...(data?.layout?.legend || {}),
      orientation: 'h',
      y: -0.15,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface rounded-xl border border-border overflow-hidden shadow-sm ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{title || 'Chart'}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
            title="Download PNG"
          >
            <HiArrowDownTray className="w-4 h-4" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <HiArrowsPointingIn className="w-4 h-4" />
            ) : (
              <HiArrowsPointingOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div className={`p-3 ${isFullscreen ? 'h-[calc(100%-48px)]' : 'h-80'}`}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="space-y-3 w-full px-4">
              <div className="skeleton h-4 w-3/4 mx-auto" />
              <div className="skeleton h-40 w-full rounded-lg" />
              <div className="skeleton h-4 w-1/2 mx-auto" />
            </div>
          </div>
        ) : data ? (
          <Plot
            data={data.data || []}
            layout={chartLayout}
            config={{
              responsive: true,
              displayModeBar: false,
            }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
            No chart data available
          </div>
        )}
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/40 -z-10"
          onClick={handleFullscreen}
        />
      )}
    </motion.div>
  );
}
