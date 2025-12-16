/**
 * TITANE∞ v24.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v24.2.0 - Metrics Card Component
 * Carte d'affichage pour une métrique
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MetricsCardProps {
  title: string;
  value: string | number | unknown;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
  format?: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'info',
  className = '',
}) => {
  const colorClasses = {
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm opacity-70 mb-1">{title}</p>
          <p className="text-2xl font-bold">{String(value)}</p>
          {trend && trendValue && (
            <p className="text-xs mt-1 opacity-60">
              {trendIcons[trend]} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-2">
            <Icon size={24} className="opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
};
