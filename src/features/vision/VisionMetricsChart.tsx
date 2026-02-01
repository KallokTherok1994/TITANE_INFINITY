/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * VisionMetricsChart - Graphiques métriques Vision en temps réel
 * Utilise les données du useVisionStore pour afficher détection, affect, body language
 */

import React, { memo, useMemo } from 'react';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useVisionStore } from '@/stores/useVisionStore';
import type { AffectHistoryEntry } from '@/types/visionAffect';
import { Camera, Activity, Brain, User } from 'lucide-react';
import './VisionMetricsChart.css';

interface VisionMetricsChartProps {
  timeRange?: number; // Minutes de données à afficher
  showDetection?: boolean;
  showAffect?: boolean;
  showBodyLanguage?: boolean;
}

const levelToPercent = (level: string | null | undefined): number => {
  switch (level) {
    case 'low':
      return 25;
    case 'medium':
      return 50;
    case 'high':
      return 75;
    default:
      return 0;
  }
};

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

export const VisionMetricsChart: React.FC<VisionMetricsChartProps> = memo(
  ({
    timeRange = 10,
    showDetection = true,
    showAffect = true,
    showBodyLanguage = true,
  }) => {
    const tooltipContent = useMemo(() => <CustomTooltip />, []);
    const isActive = useVisionStore(
      state => state.isObservationActive && state.visionInput.streamActive
    );
    const affectHistory = useVisionStore(state => state.affectEstimation.history);
    const bodyLanguage = useVisionStore(state => state.bodyLanguage);

    const cutoffTimestamp = useMemo(() => Date.now() - timeRange * 60_000, [timeRange]);

    const recentAffect = useMemo(
      () =>
        (affectHistory || [])
          .filter((item: AffectHistoryEntry) => item.timestamp >= cutoffTimestamp)
          .slice(-60),
      [affectHistory, cutoffTimestamp]
    );

    const chartData = useMemo(
      () =>
        recentAffect.map(item => ({
          time: timeFormatter.format(item.timestamp),
          confidence: Math.round((item.confidence || 0) * 100),
          objects: 0,
          energy: levelToPercent(item.energy),
          tension: levelToPercent(item.tension),
          engagement: levelToPercent(item.engagement),
        })),
      [recentAffect]
    );

    // Données pour radar body language
    const bodyLanguageData = useMemo(() => {
      return [
        { metric: 'Posture', value: Math.round((bodyLanguage.postureScore || 0) * 100) },
        {
          metric: 'Mouvement',
          value: Math.round((bodyLanguage.movementScore || 0) * 100),
        },
        {
          metric: 'Regard',
          value: Math.round((bodyLanguage.gazeStabilityScore || 0) * 100),
        },
        { metric: 'Visage', value: Math.round((bodyLanguage.facialActivity || 0) * 100) },
        {
          metric: 'Symétrie',
          value: Math.round((bodyLanguage.shoulderSymmetry || 0) * 100),
        },
      ];
    }, [bodyLanguage]);

    if (!isActive) {
      return (
        <div className="vision-metrics-inactive">
          <Camera size={48} className="inactive-icon" />
          <p>Vision inactive — Activez la caméra pour voir les métriques</p>
        </div>
      );
    }

    return (
      <div className="vision-metrics-container">
        {/* Detection Chart */}
        {showDetection && (
          <div className="vision-chart-card">
            <div className="vision-chart-header">
              <Activity className="chart-icon" size={18} />
              <h4>Détection & Confiance</h4>
              <span className="chart-badge good">Active</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={tooltipContent} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="confidence"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorConfidence)"
                  name="Confiance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Affect Chart */}
        {showAffect && (
          <div className="vision-chart-card">
            <div className="vision-chart-header">
              <Brain className="chart-icon" size={18} />
              <h4>Estimation Affective</h4>
              <span className="chart-badge">Temps Réel</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={tooltipContent} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Énergie"
                />
                <Line
                  type="monotone"
                  dataKey="tension"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Tension"
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Body Language Radar */}
        {showBodyLanguage && (
          <div className="vision-chart-card">
            <div className="vision-chart-header">
              <User className="chart-icon" size={18} />
              <h4>Body Language</h4>
              <span className="chart-badge info">Analyse</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={bodyLanguageData}>
                <PolarGrid stroke="rgba(100, 116, 139, 0.2)" />
                <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" fontSize={11} />
                <PolarRadiusAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={tooltipContent} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="#a855f7"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }
);

VisionMetricsChart.displayName = 'VisionMetricsChart';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="vision-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: <strong>{Math.round(entry.value || 0)}%</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};
