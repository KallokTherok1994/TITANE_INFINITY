/**
 * TITANE∞ — LiveMetricCard
 * Displays a single live or degraded metric with explicit source truth.
 */

import React from 'react';

export type MetricSource = 'live' | 'cached' | 'static_curated' | 'degraded' | 'unknown';

interface LiveMetricCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  icon?: string;
  source: MetricSource;
  /** Shown when value is null/undefined */
  emptyReason?: string;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  testId?: string;
  className?: string;
}

const SOURCE_STYLES: Record<MetricSource, { badge: string; dot: string }> = {
  live: { badge: 'bg-green-900/40 text-green-300 border-green-700/40', dot: 'bg-green-400' },
  cached: { badge: 'bg-blue-900/40 text-blue-300 border-blue-700/40', dot: 'bg-blue-400' },
  static_curated: { badge: 'bg-amber-900/40 text-amber-300 border-amber-700/40', dot: 'bg-amber-400' },
  degraded: { badge: 'bg-red-900/40 text-red-300 border-red-700/40', dot: 'bg-red-400' },
  unknown: { badge: 'bg-titanium-bg-overlay text-titanium-text-disabled border-titanium-border-default', dot: 'bg-titanium-text-disabled' },
};

const TREND_ICONS: Record<NonNullable<LiveMetricCardProps['trend']>, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export const LiveMetricCard: React.FC<LiveMetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  source,
  emptyReason,
  trend,
  testId,
  className = '',
}) => {
  const styles = SOURCE_STYLES[source];
  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <div
      data-testid={testId ?? `metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
      data-metric-source={source}
      className={`
        flex flex-col gap-1.5 p-4 rounded-lg border
        bg-titanium-bg-elevated border-titanium-border-default
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {/* Label + source indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon && <span aria-hidden="true" className="text-base">{icon}</span>}
          <span className="text-xs text-titanium-text-secondary font-medium">{label}</span>
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${styles.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
          {source === 'static_curated' ? 'exemple' : source}
        </div>
      </div>

      {/* Value */}
      {hasValue ? (
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-titanium-text-primary">
            {String(value)}
          </span>
          {unit && <span className="text-xs text-titanium-text-secondary">{unit}</span>}
          {trend && (
            <span
              className={`text-xs ml-1 ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-titanium-text-disabled'
              }`}
              aria-label={`trend: ${trend}`}
            >
              {TREND_ICONS[trend]}
            </span>
          )}
        </div>
      ) : (
        <div className="text-xs text-titanium-text-disabled italic">
          {emptyReason ?? 'Non disponible'}
        </div>
      )}
    </div>
  );
};

/** Horizontal strip of module status indicators */
export const ModuleHealthStrip: React.FC<{
  modules: Array<{ id: string; label: string; status: 'live' | 'partial' | 'degraded' | 'unknown' }>;
  className?: string;
}> = ({ modules, className = '' }) => {
  const STATUS_COLORS: Record<string, string> = {
    live: 'bg-green-400',
    partial: 'bg-amber-400',
    degraded: 'bg-red-400',
    unknown: 'bg-titanium-text-disabled',
  };

  return (
    <div
      data-testid="module-health-strip"
      className={`flex flex-wrap gap-2 ${className}`}
      aria-label="Module health status"
    >
      {modules.map(m => (
        <div
          key={m.id}
          data-testid={`health-${m.id}`}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-titanium-bg-overlay border border-titanium-border-default"
        >
          <span
            className={`w-2 h-2 rounded-full ${STATUS_COLORS[m.status] ?? STATUS_COLORS.unknown}`}
            aria-hidden="true"
          />
          <span className="text-xs text-titanium-text-secondary">{m.label}</span>
        </div>
      ))}
    </div>
  );
};

/** Small runtime status pill */
export const RuntimeStatusPill: React.FC<{
  status: 'live' | 'partial' | 'degraded' | 'blocked' | 'unknown';
  label?: string;
  testId?: string;
}> = ({ status, label, testId }) => {
  const STYLES: Record<string, string> = {
    live: 'bg-green-900/40 text-green-300 border-green-700/40',
    partial: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
    degraded: 'bg-red-900/40 text-red-300 border-red-700/40',
    blocked: 'bg-red-900/60 text-red-200 border-red-700/60',
    unknown: 'bg-titanium-bg-overlay text-titanium-text-disabled border-titanium-border-default',
  };

  return (
    <span
      data-testid={testId ?? `status-pill-${status}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${STYLES[status] ?? STYLES.unknown}`}
    >
      {label ?? status.toUpperCase()}
    </span>
  );
};
