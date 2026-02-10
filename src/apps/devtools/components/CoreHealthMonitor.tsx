/**
 * TITANE∞ v22.0 — CoreHealthMonitor Component
 * 9-engine health monitoring dashboard
 */

import React, { useState, useEffect } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import './CoreHealthMonitor.css';

type CoreHealth = 'Healthy' | 'Degraded' | 'Failing' | 'Unknown';

interface CoreInfo {
  id: string;
  name: string;
  health: CoreHealth;
  cpu_usage: number;
  memory_usage_mb: number;
  operations_count: number;
  uptime_seconds: number;
  last_heartbeat: string;
}

interface CoreHealthResponse {
  success: boolean;
  data?: CoreInfo[];
  error?: string;
}

export const CoreHealthMonitor: React.FC = () => {
  const [cores, setCores] = useState<CoreInfo[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch core health
  const fetchCoreHealth = async () => {
    try {
      const response = (await tauriClient.getCoreInfo()) as CoreHealthResponse;
      if (response.success && response.data) {
        setCores(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch core health:', error);
    }
  };

  // Auto-refresh
  useEffect(() => {
    fetchCoreHealth();
    if (autoRefresh) {
      const interval = setInterval(fetchCoreHealth, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Restart failing cores
  const restartFailingCores = async () => {
    try {
      const failingCores = cores.filter(c => c.health === 'Failing').map(c => c.id);
      if (failingCores.length > 0) {
        await tauriClient.restartCores({ coreIds: failingCores });
        fetchCoreHealth();
      }
    } catch (error) {
      console.error('Failed to restart cores:', error);
    }
  };

  // Get health color
  const getHealthColor = (health: CoreHealth): string => {
    switch (health) {
      case 'Healthy':
        return '#10b981';
      case 'Degraded':
        return '#f59e0b';
      case 'Failing':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Calculate overall health
  const calculateOverallHealth = (): number => {
    if (cores.length === 0) return 0;
    const healthyCores = cores.filter(c => c.health === 'Healthy').length;
    return (healthyCores / cores.length) * 100;
  };

  // Format uptime
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const overallHealth = calculateOverallHealth();

  return (
    <div className="core-health-monitor">
      {/* Controls */}
      <div className="core-controls">
        <div className="core-overall-health">
          <div
            className="core-health-indicator"
            style={{
              backgroundColor: getHealthColor(
                overallHealth >= 75
                  ? 'Healthy'
                  : overallHealth >= 50
                    ? 'Degraded'
                    : 'Failing'
              ),
            }}
          />
          <span className="core-health-text">
            Overall Health: <strong>{overallHealth.toFixed(0)}%</strong>
          </span>
          <span className="core-health-count">
            {cores.filter(c => c.health === 'Healthy').length}/{cores.length} cores
            healthy
          </span>
        </div>

        <div className="core-actions">
          <label className="core-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (3s)</span>
          </label>

          <button className="core-btn" onClick={fetchCoreHealth}>
            🔄 Refresh
          </button>

          {cores.some(c => c.health === 'Failing') && (
            <button className="core-btn core-btn-danger" onClick={restartFailingCores}>
              🔁 Restart Failing Cores
            </button>
          )}
        </div>
      </div>

      {/* Core Grid */}
      <div className="core-grid">
        {cores.length === 0 ? (
          <div className="core-empty">
            <span>⚙️</span>
            <p>No cores detected</p>
          </div>
        ) : (
          cores.map(core => (
            <div key={core.id} className="core-card">
              <div className="core-card-header">
                <div
                  className="core-status-indicator"
                  style={{ backgroundColor: getHealthColor(core.health) }}
                />
                <div className="core-name">{core.name}</div>
                <div
                  className="core-health-badge"
                  style={{ color: getHealthColor(core.health) }}
                >
                  {core.health}
                </div>
              </div>

              <div className="core-metrics">
                <div className="core-metric">
                  <span className="core-metric-label">CPU</span>
                  <span className="core-metric-value">{core.cpu_usage.toFixed(1)}%</span>
                </div>
                <div className="core-metric">
                  <span className="core-metric-label">RAM</span>
                  <span className="core-metric-value">
                    {core.memory_usage_mb.toFixed(0)}MB
                  </span>
                </div>
                <div className="core-metric">
                  <span className="core-metric-label">Ops</span>
                  <span className="core-metric-value">
                    {core.operations_count.toLocaleString()}
                  </span>
                </div>
                <div className="core-metric">
                  <span className="core-metric-label">Uptime</span>
                  <span className="core-metric-value">
                    {formatUptime(core.uptime_seconds)}
                  </span>
                </div>
              </div>

              <div className="core-heartbeat">
                Last heartbeat: {new Date(core.last_heartbeat).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
