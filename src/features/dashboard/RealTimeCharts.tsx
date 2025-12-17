/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * RealTimeCharts - Graphiques temps réel pour Vue d'Ensemble
 * Affiche métriques système, performance, et activité
 */

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Cpu, MessageSquare, Zap } from 'lucide-react';
import './RealTimeCharts.css';

interface ChartData {
  timestamp: string;
  value: number;
  label?: string;
}

interface RealTimeChartsProps {
  performanceData?: ChartData[];
  messagesData?: ChartData[];
  cpuData?: ChartData[];
  activityData?: ChartData[];
}

export const RealTimeCharts: React.FC<RealTimeChartsProps> = ({
  performanceData = generateMockData(20),
  messagesData = generateMockData(15),
  cpuData = generateMockData(30),
  activityData = generateMockData(24),
}) => {
  // Custom Tooltip avec typing strict
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          <p className="chart-tooltip-value">
            {payload[0].name}: <strong>{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="realtime-charts-container">
      {/* Performance Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <Zap className="chart-icon" size={18} />
          <h4>Performance Temps Réel</h4>
          <span className="chart-badge good">Optimal</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorPerf)"
              name="Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Messages Activity */}
      <div className="chart-card">
        <div className="chart-header">
          <MessageSquare className="chart-icon" size={18} />
          <h4>Activité Messages</h4>
          <span className="chart-badge">128 msg/h</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={messagesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
              name="Messages"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CPU Usage */}
      <div className="chart-card">
        <div className="chart-header">
          <Cpu className="chart-icon" size={18} />
          <h4>Utilisation CPU</h4>
          <span className="chart-badge warning">Modérée</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={cpuData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorCpu)"
              name="CPU %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Distribution */}
      <div className="chart-card">
        <div className="chart-header">
          <Activity className="chart-icon" size={18} />
          <h4>Distribution Activité</h4>
          <span className="chart-badge">24h</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Activité" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * Generate mock data for demo
 */
function generateMockData(count: number): ChartData[] {
  const data: ChartData[] = [];
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now - i * 60000); // 1 minute intervals
    data.push({
      timestamp: `${timestamp.getHours()}:${String(timestamp.getMinutes()).padStart(2, '0')}`,
      value: Math.floor(Math.random() * 50) + 50, // 50-100
    });
  }

  return data;
}

/**
 * QuickStatsCard - Carte statistique compacte
 */
interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export const QuickStatCard: React.FC<QuickStatProps> = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  color = '#3b82f6',
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return '#94a3b8';
  };

  return (
    <div className="quick-stat-card">
      <div className="quick-stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="quick-stat-content">
        <div className="quick-stat-label">{label}</div>
        <div className="quick-stat-value">{value}</div>
        {trend && trendValue && (
          <div className="quick-stat-trend" style={{ color: getTrendColor() }}>
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};
