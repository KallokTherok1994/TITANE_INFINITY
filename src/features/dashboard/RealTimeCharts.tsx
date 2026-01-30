/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * RealTimeCharts - Graphiques temps réel pour Vue d'Ensemble
 * Affiche métriques système, performance, et activité
 */

import React, { memo, useMemo } from 'react';
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

// Custom Tooltip avec typing strict (extrait pour éviter recréation)
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">
          {payload[0]?.name ?? 'Value'}: <strong>{payload[0]?.value ?? 'N/A'}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export const RealTimeCharts: React.FC<RealTimeChartsProps> = memo(({
  performanceData,
  messagesData,
  cpuData,
  activityData,
}) => {
  const tooltipContent = useMemo(() => <CustomTooltip />, []);
  const resolvedPerformanceData = useMemo(
    () => performanceData ?? generateMockData(20),
    [performanceData]
  );
  const resolvedMessagesData = useMemo(
    () => messagesData ?? generateMockData(15),
    [messagesData]
  );
  const resolvedCpuData = useMemo(() => cpuData ?? generateMockData(30), [cpuData]);
  const resolvedActivityData = useMemo(
    () => activityData ?? generateMockData(24),
    [activityData]
  );

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
          <AreaChart data={resolvedPerformanceData}>
            <defs>
              <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={tooltipContent} />
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
          <LineChart data={resolvedMessagesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={tooltipContent} />
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
          <AreaChart data={resolvedCpuData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={tooltipContent} />
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
          <BarChart data={resolvedActivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={tooltipContent} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Activité" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

RealTimeCharts.displayName = 'RealTimeCharts';

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

