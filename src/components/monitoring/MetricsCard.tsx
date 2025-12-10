/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Metrics Card Component
 * Affiche une métrique avec valeur, tendance, seuils d'alerte
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

export interface MetricsCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  thresholds?: {
    warning: number;
    critical: number;
  };
  format?: 'number' | 'percentage' | 'duration' | 'bytes';
  className?: string;
}

/**
 * Formater valeur selon type
 */
function formatValue(value: number | string, format?: string, unit?: string): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'duration':
      if (value < 1000) return `${value.toFixed(0)}ms`;
      return `${(value / 1000).toFixed(2)}s`;
    case 'bytes':
      if (value < 1024) return `${value}B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)}KB`;
      return `${(value / (1024 * 1024)).toFixed(1)}MB`;
    case 'number':
    default:
      return value.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + (unit || '');
  }
}

/**
 * Déterminer status selon seuils
 */
function getStatus(
  value: number | string,
  thresholds?: { warning: number; critical: number }
): 'normal' | 'warning' | 'critical' {
  if (!thresholds || typeof value !== 'number') return 'normal';

  if (value >= thresholds.critical) return 'critical';
  if (value >= thresholds.warning) return 'warning';
  return 'normal';
}

/**
 * Obtenir couleurs selon status
 */
function getStatusColors(status: 'normal' | 'warning' | 'critical'): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (status) {
    case 'critical':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-500',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-500',
      };
    case 'normal':
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: 'text-blue-500',
      };
  }
}

/**
 * MetricsCard Component
 */
export const MetricsCard: React.FC<MetricsCardProps> = React.memo(
  ({ title, value, unit, trend, trendValue, thresholds, format, className = '' }) => {
    const numericValue = typeof value === 'number' ? value : 0;
    const status = getStatus(numericValue, thresholds);
    const colors = getStatusColors(status);
    const formattedValue = formatValue(value, format, unit);

    // Icône de tendance
    const TrendIcon =
      trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    const trendColor =
      trend === 'up'
        ? 'text-green-400'
        : trend === 'down'
          ? 'text-red-400'
          : 'text-gray-400';

    return (
      <div
        className={`
        relative rounded-lg border ${colors.border} ${colors.bg}
        p-4 transition-all duration-200 hover:shadow-lg
        ${className}
      `}
      >
        {/* Alerte critique */}
        {status === 'critical' && (
          <div className="absolute top-2 right-2">
            <AlertTriangle className={`w-5 h-5 ${colors.icon} animate-pulse`} />
          </div>
        )}

        {/* Titre */}
        <div className="text-sm font-medium text-gray-400 mb-2">{title}</div>

        {/* Valeur principale */}
        <div className={`text-3xl font-bold ${colors.text} mb-2`}>{formattedValue}</div>

        {/* Tendance */}
        {trend && trendValue !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={trendColor}>
              {trendValue > 0 ? '+' : ''}
              {format === 'percentage'
                ? `${(trendValue * 100).toFixed(1)}%`
                : trendValue.toFixed(1)}
            </span>
            <span className="text-gray-500 ml-1">vs précédent</span>
          </div>
        )}

        {/* Barre de status */}
        {status !== 'normal' && thresholds && typeof value === 'number' && (
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                status === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
              } transition-all duration-300`}
              style={{
                width: `${Math.min((value / thresholds.critical) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

MetricsCard.displayName = 'MetricsCard';

export default MetricsCard;
