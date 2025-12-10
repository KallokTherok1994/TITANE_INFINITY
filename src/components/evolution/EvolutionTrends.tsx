/**
 * TITANE∞ Evolution Engine - Graphique des tendances
 * Copyright (c) 2025 MUSIC∞AI
 */

import React, { useMemo } from 'react';
import type {
  PerformanceTrend,
  TrendDirection,
} from '../../services/evolutionEngine/evolutionEngine.config';
import './EvolutionTrends.css';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface EvolutionTrendsProps {
  trends: PerformanceTrend[];
  timeRange?: '1h' | '24h' | '7d' | '30d';
  onTrendSelect?: (trend: PerformanceTrend) => void;
  className?: string;
}

interface TrendChartProps {
  trend: PerformanceTrend;
  onClick?: () => void;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

const TREND_COLORS: Record<TrendDirection, string> = {
  IMPROVING: '#22c55e',
  STABLE: '#3b82f6',
  DEGRADING: '#ef4444',
  VOLATILE: '#f59e0b',
};

const TREND_ICONS: Record<TrendDirection, string> = {
  IMPROVING: '📈',
  STABLE: '➡️',
  DEGRADING: '📉',
  VOLATILE: '📊',
};

const formatMetricName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const generateSparklinePath = (
  samples: Array<{ value: number }>,
  width: number,
  height: number
): string => {
  if (samples.length < 2) return '';

  const values = samples.map(s => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = samples.map((sample, i) => {
    const x = (i / (samples.length - 1)) * width;
    const y = height - ((sample.value - min) / range) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

const TrendChart: React.FC<TrendChartProps> = React.memo(({ trend, onClick }) => {
  const {
    metric,
    samples,
    average,
    min,
    max,
    stdDeviation,
    trend: direction,
    anomalyCount,
  } = trend;
  const color = TREND_COLORS[direction];
  const icon = TREND_ICONS[direction];

  const sparklinePath = useMemo(
    () => generateSparklinePath(samples.slice(-20), 120, 40),
    [samples]
  );

  const changePercent = useMemo(() => {
    if (samples.length < 2) return 0;
    const first = samples[0].value;
    const last = samples[samples.length - 1].value;
    return first !== 0 ? ((last - first) / first) * 100 : 0;
  }, [samples]);

  return (
    <div className="trend-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="trend-header">
        <span className="trend-icon">{icon}</span>
        <span className="trend-metric">{formatMetricName(metric)}</span>
        <span className="trend-direction" style={{ color }}>
          {direction}
        </span>
      </div>

      <div className="trend-chart">
        <svg viewBox="0 0 120 40" className="sparkline">
          <path d={sparklinePath} fill="none" stroke={color} strokeWidth="2" />
        </svg>
      </div>

      <div className="trend-stats">
        <div className="stat">
          <span className="stat-label">Moy</span>
          <span className="stat-value">{average.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Min</span>
          <span className="stat-value">{min.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Max</span>
          <span className="stat-value">{max.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">σ</span>
          <span className="stat-value">{stdDeviation.toFixed(2)}</span>
        </div>
      </div>

      <div className="trend-footer">
        <span
          className={`change-badge ${changePercent >= 0 ? 'positive' : 'negative'}`}
          style={{ backgroundColor: `${color}20`, color }}
        >
          {changePercent >= 0 ? '+' : ''}
          {changePercent.toFixed(1)}%
        </span>
        {anomalyCount > 0 && (
          <span className="anomaly-badge">⚠️ {anomalyCount} anomalies</span>
        )}
      </div>
    </div>
  );
});

TrendChart.displayName = 'TrendChart';

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const EvolutionTrends: React.FC<EvolutionTrendsProps> = ({
  trends,
  timeRange = '24h',
  onTrendSelect,
  className = '',
}) => {
  const sortedTrends = useMemo(() => {
    return [...trends].sort((a, b) => {
      // Prioritize degrading and volatile trends
      const priorityOrder: Record<TrendDirection, number> = {
        DEGRADING: 0,
        VOLATILE: 1,
        STABLE: 2,
        IMPROVING: 3,
      };
      return priorityOrder[a.trend] - priorityOrder[b.trend];
    });
  }, [trends]);

  const summary = useMemo(
    () => ({
      improving: trends.filter(t => t.trend === 'IMPROVING').length,
      stable: trends.filter(t => t.trend === 'STABLE').length,
      degrading: trends.filter(t => t.trend === 'DEGRADING').length,
      volatile: trends.filter(t => t.trend === 'VOLATILE').length,
      totalAnomalies: trends.reduce((sum, t) => sum + t.anomalyCount, 0),
    }),
    [trends]
  );

  return (
    <div className={`evolution-trends ${className}`}>
      <header className="trends-header">
        <h3>📊 Tendances de Performance</h3>
        <div className="time-range-badge">{timeRange}</div>
      </header>

      <div className="trends-summary">
        <div className="summary-item improving">
          <span className="summary-icon">📈</span>
          <span className="summary-count">{summary.improving}</span>
          <span className="summary-label">En amélioration</span>
        </div>
        <div className="summary-item stable">
          <span className="summary-icon">➡️</span>
          <span className="summary-count">{summary.stable}</span>
          <span className="summary-label">Stables</span>
        </div>
        <div className="summary-item degrading">
          <span className="summary-icon">📉</span>
          <span className="summary-count">{summary.degrading}</span>
          <span className="summary-label">En dégradation</span>
        </div>
        <div className="summary-item volatile">
          <span className="summary-icon">📊</span>
          <span className="summary-count">{summary.volatile}</span>
          <span className="summary-label">Volatiles</span>
        </div>
      </div>

      {summary.totalAnomalies > 0 && (
        <div className="anomaly-alert">
          ⚠️ {summary.totalAnomalies} anomalies détectées
        </div>
      )}

      <div className="trends-grid">
        {sortedTrends.length === 0 ? (
          <div className="empty-trends">
            <span className="empty-icon">📈</span>
            <p>Pas assez de données pour les tendances</p>
            <small>Les tendances apparaîtront après quelques heures d'utilisation</small>
          </div>
        ) : (
          sortedTrends.map(trend => (
            <TrendChart
              key={trend.metric}
              trend={trend}
              onClick={() => onTrendSelect?.(trend)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EvolutionTrends;
