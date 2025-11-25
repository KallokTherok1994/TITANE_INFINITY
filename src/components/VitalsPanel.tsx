/**
 * TITANE∞ v14 — VitalsPanel Component
 * Real-time system vitals display for Chat IA
 */

import React, { useEffect, useState } from 'react';
import './VitalsPanel.css';

interface VitalsPanelProps {
  currentMode?: string;
  provider?: string;
  latency?: number;
  cpuLoad?: number;
  messagesCount?: number;
  anomalyCount?: number; // SENTINEL tracking
}

export const VitalsPanel: React.FC<VitalsPanelProps> = ({
  currentMode = 'default',
  provider = 'auto',
  latency = 0,
  cpuLoad = 0,
  messagesCount = 0,
  anomalyCount = 0,
}) => {
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    // Calcul usage mémoire localStorage
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('titane_chat_')) {
          const value = localStorage.getItem(key);
          total += (value?.length || 0);
        }
      }
      setMemoryUsage(Math.round(total / 1024)); // KB
    } catch {}
  }, [messagesCount]);

  const getLatencyColor = () => {
    if (latency < 1000) return 'var(--success-color)';
    if (latency < 3000) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  const getCpuColor = () => {
    if (cpuLoad < 50) return 'var(--success-color)';
    if (cpuLoad < 80) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  return (
    <div className="vitals-panel">
      <div className="vitals-title">⚡ System Vitals</div>

      <div className="vitals-grid">
        <div className="vital-item">
          <span className="vital-label">Mode:</span>
          <span className="vital-value mode">{currentMode}</span>
        </div>

        <div className="vital-item">
          <span className="vital-label">Provider:</span>
          <span className="vital-value">{provider}</span>
        </div>

        <div className="vital-item">
          <span className="vital-label">Latency:</span>
          <span className="vital-value" style={{ color: getLatencyColor() }}>
            {latency > 0 ? `${latency}ms` : '-'}
          </span>
        </div>

        <div className="vital-item">
          <span className="vital-label">CPU:</span>
          <span className="vital-value" style={{ color: getCpuColor() }}>
            {cpuLoad > 0 ? `${cpuLoad}%` : '-'}
          </span>
        </div>

        <div className="vital-item">
          <span className="vital-label">Messages:</span>
          <span className="vital-value">{messagesCount}</span>
        </div>

        <div className="vital-item">
          <span className="vital-label">Memory:</span>
          <span className="vital-value">{memoryUsage} KB</span>
        </div>

        <div className="vital-item">
          <span className="vital-label">Anomalies:</span>
          <span className="vital-value" style={{ color: anomalyCount > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
            {anomalyCount}
          </span>
        </div>
      </div>
    </div>
  );
};
