/**
 * @file MetricsGraph.tsx
 * @description Composant de graphiques de métriques - TITANE∞ Performance Engine vΩ∞Ω+
 * @version 1.0.0
 * @license TITANE_INFINITY_∞_OMEGA+_LICENSE
 */

import React, { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Settings,
} from 'lucide-react';
import type {
  MetricType,
  MetricsSnapshot,
  ThresholdConfig,
} from '../../services/performanceEngine/performanceEngine.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GraphType = 'line' | 'area' | 'stacked';
export type TimeRange = '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '24h';

export interface MetricSeriesConfig {
  key: MetricType;
  label: string;
  color: string;
  unit: string;
  visible: boolean;
  yAxisId?: 'left' | 'right';
}

export interface GraphDataPoint {
  timestamp: number;
  time: string;
  [key: string]: number | string;
}

export interface ThresholdLine {
  value: number;
  label: string;
  color: string;
  type: 'warning' | 'critical';
}

export interface MetricHistoryPoint {
  timestamp: number;
  value: number;
}

export interface MetricsGraphProps {
  snapshots: MetricsSnapshot[];
  metrics: MetricSeriesConfig[];
  thresholds?: ThresholdConfig;
  graphType?: GraphType;
  timeRange?: TimeRange;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showThresholds?: boolean;
  animated?: boolean;
  onTimeRangeChange?: (range: TimeRange) => void;
  onExport?: () => void;
  className?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const TIME_RANGES: { value: TimeRange; label: string; milliseconds: number }[] = [
  { value: '1m', label: '1 min', milliseconds: 60 * 1000 },
  { value: '5m', label: '5 min', milliseconds: 5 * 60 * 1000 },
  { value: '15m', label: '15 min', milliseconds: 15 * 60 * 1000 },
  { value: '30m', label: '30 min', milliseconds: 30 * 60 * 1000 },
  { value: '1h', label: '1 heure', milliseconds: 60 * 60 * 1000 },
  { value: '6h', label: '6 heures', milliseconds: 6 * 60 * 60 * 1000 },
  { value: '24h', label: '24 heures', milliseconds: 24 * 60 * 60 * 1000 },
];

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const MetricsGraph: React.FC<MetricsGraphProps> = ({
  snapshots,
  metrics,
  thresholds,
  graphType = 'line',
  timeRange = '5m',
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showThresholds = true,
  animated = true,
  onTimeRangeChange,
  onExport,
  className = '',
}) => {
  // États locaux
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRange);
  const [visibleSeries, setVisibleSeries] = useState<Set<MetricType>>(
    new Set(metrics.filter(m => m.visible).map(m => m.key))
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  // Formateur de temps
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  // Filtrer les données par plage de temps
  const filteredData = useMemo(() => {
    const rangeConfig = TIME_RANGES.find(r => r.value === selectedRange);
    const cutoff = Date.now() - (rangeConfig?.milliseconds || 5 * 60 * 1000);

    const filtered = snapshots
      .filter(s => s.timestamp >= cutoff)
      .map(snapshot => {
        const point: GraphDataPoint = {
          timestamp: snapshot.timestamp,
          time: formatTime(snapshot.timestamp),
        };

        // Extraire les métriques
        metrics.forEach(metric => {
          const value = extractMetricValue(snapshot, metric.key);
          if (value !== undefined) {
            point[metric.key] = value;
          }
        });

        return point;
      });

    return filtered;
  }, [snapshots, selectedRange, metrics, formatTime]);

  // Calculer les lignes de seuil
  const thresholdLines = useMemo(() => {
    if (!thresholds || !showThresholds) return [];

    const lines: ThresholdLine[] = [];

    metrics.forEach(metric => {
      const thresholdValue = getThresholdForMetric(metric.key, thresholds);
      if (thresholdValue) {
        if (thresholdValue.warning) {
          lines.push({
            value: thresholdValue.warning,
            label: `${metric.label} Warning`,
            color: '#f59e0b',
            type: 'warning',
          });
        }
        if (thresholdValue.critical) {
          lines.push({
            value: thresholdValue.critical,
            label: `${metric.label} Critical`,
            color: '#ef4444',
            type: 'critical',
          });
        }
      }
    });

    return lines;
  }, [thresholds, metrics, showThresholds]);

  // Calculer les tendances
  const trends = useMemo(() => {
    const result: Record<MetricType, 'up' | 'down' | 'stable'> = {} as Record<
      MetricType,
      'up' | 'down' | 'stable'
    >;

    metrics.forEach(metric => {
      const values = filteredData
        .map(d => d[metric.key] as number)
        .filter(v => typeof v === 'number');

      if (values.length >= 2) {
        const recent = values.slice(-5);
        const older = values.slice(-10, -5);

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg =
          older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

        const change = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (change > 5) result[metric.key] = 'up';
        else if (change < -5) result[metric.key] = 'down';
        else result[metric.key] = 'stable';
      } else {
        result[metric.key] = 'stable';
      }
    });

    return result;
  }, [filteredData, metrics]);

  // Handlers
  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedRange(range);
      onTimeRangeChange?.(range);
    },
    [onTimeRangeChange]
  );

  const toggleSeries = useCallback((key: MetricType) => {
    setVisibleSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Tooltip personnalisé
  const CustomTooltip = useCallback(
    ({
      active,
      payload,
      label,
    }: {
      active?: boolean;
      payload?: Array<{ dataKey: string; value: number; color: string }>;
      label?: string;
    }) => {
      if (!active || !payload || !showTooltip) return null;

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/95 backdrop-blur-md rounded-lg p-3 shadow-xl border border-slate-700"
        >
          <p className="text-slate-400 text-xs mb-2">{label}</p>
          {payload.map((entry, index) => {
            const metric = metrics.find(m => m.key === entry.dataKey);
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300">{metric?.label}:</span>
                <span className="text-white font-medium">
                  {formatMetricValue(entry.value, metric?.unit || '')}
                </span>
              </div>
            );
          })}
        </motion.div>
      );
    },
    [metrics, showTooltip]
  );

  // Légende personnalisée
  const CustomLegend = useCallback(() => {
    if (!showLegend) return null;

    return (
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {metrics.map((metric, index) => {
          const isVisible = visibleSeries.has(metric.key);
          const trend = trends[metric.key];
          const TrendIcon =
            trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

          return (
            <motion.button
              key={metric.key}
              onClick={() => toggleSeries(metric.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg
                transition-all duration-200
                ${
                  isVisible
                    ? 'bg-slate-700/50 text-white'
                    : 'bg-slate-800/50 text-slate-500'
                }
              `}
            >
              <div
                className={`w-3 h-3 rounded-full ${isVisible ? '' : 'opacity-30'}`}
                style={{ backgroundColor: metric.color || DEFAULT_COLORS[index] }}
              />
              <span className="text-sm">{metric.label}</span>
              <TrendIcon
                size={14}
                className={
                  trend === 'up'
                    ? 'text-red-400'
                    : trend === 'down'
                      ? 'text-green-400'
                      : 'text-slate-400'
                }
              />
            </motion.button>
          );
        })}
      </div>
    );
  }, [metrics, visibleSeries, trends, showLegend, toggleSeries]);

  // Rendu du graphique
  const renderChart = () => {
    const ChartComponent = graphType === 'area' ? AreaChart : LineChart;
    // DataComponent utilisé dynamiquement via graphType
    const _DataComponent = graphType === 'area' ? Area : Line;

    return (
      <ResponsiveContainer width="100%" height={height * zoomLevel}>
        <ChartComponent data={filteredData}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.1)"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />

          <YAxis
            yAxisId="left"
            stroke="#64748b"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={value => formatCompactNumber(value)}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#64748b"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={value => `${value}%`}
          />

          {showTooltip && <Tooltip content={<CustomTooltip />} />}

          {/* Lignes de seuil */}
          {thresholdLines.map((threshold, index) => (
            <ReferenceLine
              key={index}
              y={threshold.value}
              yAxisId="left"
              stroke={threshold.color}
              strokeDasharray="5 5"
              label={{
                value: threshold.label,
                position: 'right',
                fill: threshold.color,
                fontSize: 10,
              }}
            />
          ))}

          {/* Séries de données */}
          {metrics.map((metric, index) => {
            if (!visibleSeries.has(metric.key)) return null;
            const color = metric.color || DEFAULT_COLORS[index];

            if (graphType === 'area') {
              return (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  yAxisId={metric.yAxisId || 'left'}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={animated}
                  animationDuration={500}
                />
              );
            }

            return (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                yAxisId={metric.yAxisId || 'left'}
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={animated}
                animationDuration={500}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50
        ${isFullscreen ? 'fixed inset-4 z-50' : ''}
        ${className}
      `}
    >
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          {/* Sélecteur de plage de temps */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            {TIME_RANGES.slice(0, 5).map(range => (
              <button
                key={range.value}
                onClick={() => handleTimeRangeChange(range.value)}
                className={`
                  px-2 py-1 text-xs rounded-md transition-all
                  ${
                    selectedRange === range.value
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Zoom arrière"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-slate-400 text-sm">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Zoom avant"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Plein écran"
          >
            <Maximize2 size={18} />
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Exporter"
            >
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Zone du graphique */}
      <div className="p-4 overflow-hidden">
        {filteredData.length > 0 ? (
          <>
            {renderChart()}
            <CustomLegend />
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <Settings size={48} className="mx-auto mb-2 opacity-50" />
              <p>Aucune donnée disponible</p>
              <p className="text-sm">Les métriques apparaîtront ici</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// UTILITAIRES
// ============================================================================

function extractMetricValue(
  snapshot: MetricsSnapshot,
  metricType: MetricType
): number | undefined {
  switch (metricType) {
    case 'cpu_global':
      return snapshot.system.cpu.global;
    case 'cpu_process':
      return snapshot.system.cpu.process;
    case 'ram_system':
      return snapshot.system.ram.system.percent;
    case 'ram_process':
      return snapshot.system.ram.process.percent;
    case 'io_read':
      return snapshot.system.io.readBytes;
    case 'io_write':
      return snapshot.system.io.writeBytes;
    case 'fps_webview':
      return snapshot.frontend.fps.current;
    case 'render_time':
      return snapshot.frontend.render.averageTime;
    case 'invoke_latency':
      return snapshot.frontend.tauri.invokeLatency;
    case 'ia_latency_ollama':
      return snapshot.ia.ollama.latency;
    case 'ia_latency_gemini':
      return snapshot.ia.gemini.latency;
    case 'ia_tokens_per_sec':
      return snapshot.ia.ollama.tokensPerSec;
    default:
      return undefined;
  }
}

function getThresholdForMetric(
  _metricType: MetricType,
  _thresholds: ThresholdConfig
): { warning?: number; critical?: number } | undefined {
  // Mapping des seuils par type de métrique
  // À implémenter selon la structure de ThresholdConfig
  return undefined;
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'ms') {
    return `${value.toFixed(0)}ms`;
  }
  if (unit === 'B' || unit === 'bytes') {
    return formatBytes(value);
  }
  if (unit === 'fps') {
    return `${Math.round(value)} FPS`;
  }
  return value.toFixed(2);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatCompactNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}G`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
}

export default MetricsGraph;
