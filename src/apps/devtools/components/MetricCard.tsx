/**
 * TITANE∞ v20.0 — MetricCard Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import { TrendGraph } from './TrendGraph';

export interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  history?: number[];
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const colorStyles: Record<string, { icon: string; trend: string }> = {
  primary: { icon: 'var(--text-primary, #727b81)', trend: 'var(--bg-primary, #727b81)' },
  success: { icon: 'var(--text-success, #93b399)', trend: 'var(--bg-success, #93b399)' },
  warning: { icon: 'var(--text-warning, #e3d5d5)', trend: 'var(--bg-warning, #e3d5d5)' },
  danger: { icon: 'var(--text-danger, #8b5f5f)', trend: 'var(--bg-danger, #8b5f5f)' },
  info: { icon: 'var(--text-info, #727b81)', trend: 'var(--bg-primary, #727b81)' },
};

const trendIcons = {
  up: '↗',
  down: '↘',
  stable: '→',
};

/**
 * MetricCard - Carte de métrique avec trend et mini graphique
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="IPC Latency"
 *   value={12}
 *   unit="ms"
 *   trend="down"
 *   history={[15, 14, 13, 12]}
 *   color="success"
 * />
 * ```
 */
export function MetricCard({
  label,
  value,
  unit,
  trend = 'stable',
  history = [],
  icon,
  color = 'primary',
  className = '',
}: MetricCardProps) {
  const colors = colorStyles[color];

  return (
    <div
      className={`rounded-lg p-4 border transition-all duration-200 hover:border-opacity-30 ${className}`}
      style={{
        background: 'var(--bg-panel, #101216)',
        borderColor: 'var(--border, rgba(196,196,196,0.12))',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="text-lg" style={{ color: colors.icon }}>
              {icon}
            </div>
          )}
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {label}
          </span>
        </div>

        {/* Trend Indicator */}
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{
            color: colors.trend,
            background: `${colors.trend}15`,
          }}
        >
          {trendIcons[trend]}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3">
        <span
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Mini Graph */}
      {history.length > 0 && (
        <div className="h-12">
          <TrendGraph data={history} color={colors.trend} />
        </div>
      )}
    </div>
  );
}
