/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * RealTimeCharts - Graphiques temps réel pour Vue d'Ensemble (CSS-only version)
 * Affiche métriques système, performance, et activité
 * Note: Simplified version without recharts dependency (removed for optimization)
 */

import React, { memo, useMemo } from 'react';
import { Activity, Cpu, MessageSquare, Zap, TrendingUp } from 'lucide-react';
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

// Génération de données mock pour démonstration
function generateMockData(count: number): ChartData[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    value: Math.floor(Math.random() * 40) + 60,
    label: `Point ${i + 1}`,
  }));
}

export const RealTimeCharts: React.FC<RealTimeChartsProps> = memo(
  ({ performanceData, messagesData, cpuData, activityData }) => {
    const resolvedPerformanceData = useMemo(() => performanceData ?? generateMockData(20), [performanceData]);
    const resolvedMessagesData = useMemo(() => messagesData ?? generateMockData(15), [messagesData]);
    const resolvedCpuData = useMemo(() => cpuData ?? generateMockData(30), [cpuData]);
    const resolvedActivityData = useMemo(() => activityData ?? generateMockData(24), [activityData]);

    // Calcul des stats moyennes
    const avgPerf = useMemo(() => Math.round(resolvedPerformanceData.reduce((sum, item) => sum + item.value, 0) / resolvedPerformanceData.length), [resolvedPerformanceData]);
    const avgMessages = useMemo(() => Math.round(resolvedMessagesData.reduce((sum, item) => sum + item.value, 0) / resolvedMessagesData.length), [resolvedMessagesData]);
    const avgCpu = useMemo(() => Math.round(resolvedCpuData.reduce((sum, item) => sum + item.value, 0) / resolvedCpuData.length), [resolvedCpuData]);
    const avgActivity = useMemo(() => Math.round(resolvedActivityData.reduce((sum, item) => sum + item.value, 0) / resolvedActivityData.length), [resolvedActivityData]);

    return (
      <div className="realtime-charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <Zap className="chart-icon" size={18} />
            <h4>Performance Temps Réel</h4>
            <span className="chart-badge good">Optimal</span>
          </div>
          <div className="simple-chart">
            <div className="chart-bars">
              {resolvedPerformanceData.slice(-10).map((item, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar perf" style={{ height: `${item.value}%` }} title={`${item.timestamp}: ${item.value}%`} />
                </div>
              ))}
            </div>
            <div className="chart-stats">
              <span>Moyenne: {avgPerf}%</span>
              <TrendingUp size={14} className="trend-icon" />
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <MessageSquare className="chart-icon" size={18} />
            <h4>Messages / Activité</h4>
            <span className="chart-badge">Actif</span>
          </div>
          <div className="simple-chart">
            <div className="chart-bars">
              {resolvedMessagesData.slice(-10).map((item, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar messages" style={{ height: `${item.value}%` }} title={`${item.timestamp}: ${item.value}%`} />
                </div>
              ))}
            </div>
            <div className="chart-stats">
              <span>Moyenne: {avgMessages}%</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Cpu className="chart-icon" size={18} />
            <h4>CPU / Ressources</h4>
            <span className="chart-badge info">Normal</span>
          </div>
          <div className="simple-chart">
            <div className="chart-bars">
              {resolvedCpuData.slice(-10).map((item, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar cpu" style={{ height: `${item.value}%` }} title={`${item.timestamp}: ${item.value}%`} />
                </div>
              ))}
            </div>
            <div className="chart-stats">
              <span>Moyenne: {avgCpu}%</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Activity className="chart-icon" size={18} />
            <h4>Activité Système</h4>
            <span className="chart-badge good">Stable</span>
          </div>
          <div className="simple-chart">
            <div className="chart-bars">
              {resolvedActivityData.slice(-10).map((item, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar activity" style={{ height: `${item.value}%` }} title={`${item.timestamp}: ${item.value}%`} />
                </div>
              ))}
            </div>
            <div className="chart-stats">
              <span>Moyenne: {avgActivity}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RealTimeCharts.displayName = 'RealTimeCharts';
