/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * QuickStatCard - Carte statistique compacte
 * Extrait de RealTimeCharts pour éviter de charger Recharts au démarrage.
 */

import React, { memo } from 'react';
import './QuickStatCard.css';

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
};

const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
  if (trend === 'up') return '#10b981';
  if (trend === 'down') return '#ef4444';
  return '#94a3b8';
};

export const QuickStatCard: React.FC<QuickStatProps> = memo(
  ({ icon, label, value, trend, trendValue, color = '#3b82f6' }) => {
    const trendIcon = getTrendIcon(trend);
    const trendColor = getTrendColor(trend);

    return (
      <div className="quick-stat-card">
        <div className="quick-stat-icon" style={{ color }}>
          {icon}
        </div>
        <div className="quick-stat-content">
          <div className="quick-stat-label">{label}</div>
          <div className="quick-stat-value">{value}</div>
          {trend && trendValue && (
            <div className="quick-stat-trend" style={{ color: trendColor }}>
              <span>{trendIcon}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

QuickStatCard.displayName = 'QuickStatCard';
