/**
 * TITANE∞ v∞ Phase 4 - Multi-Agent System
 * Multi-AI Dashboard - Visualisation temps réel des 5 agents
 */

import React, { useEffect, useState } from 'react';
import { multiAgentEngine } from '../../core/ai/multi_agent_engine';
import type { AgentState } from '../../core/ai/multi_agent_engine';

interface DashboardMetrics {
  globalCoherence: number;
  globalStability: number;
  globalLoad: number;
  totalErrors: number;
  agentStates: Map<string, AgentState>;
}

export const MultiAIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    globalCoherence: 100,
    globalStability: 100,
    globalLoad: 0,
    totalErrors: 0,
    agentStates: new Map(),
  });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      const engineState = multiAgentEngine.getState();
      const agentStates = multiAgentEngine.getAllAgentStates();

      setMetrics({
        globalCoherence: engineState.globalCoherence || 100,
        globalStability: engineState.globalStability || 100,
        globalLoad: engineState.globalLoad || 0,
        totalErrors: engineState.totalErrors || 0,
        agentStates,
      });
      setIsRunning(engineState.isRunning || false);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePauseAgent = async (agentId: string) => {
    await multiAgentEngine.pauseAgent(agentId);
  };

  const handleResumeAgent = async (agentId: string) => {
    await multiAgentEngine.resumeAgent(agentId);
  };

  const handleRestartAgent = async (agentId: string) => {
    await multiAgentEngine.pauseAgent(agentId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await multiAgentEngine.resumeAgent(agentId);
  };

  const getHealthColor = (health: number): string => {
    if (health >= 80) return '#10b981'; // green
    if (health >= 50) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const agentIcons: Record<string, string> = {
    helios: '☀️',
    harmonia: '🎵',
    persona: '🎭',
    'memory-core': '🧠',
    watchdog: '🛡️',
  };

  const agentDescriptions: Record<string, string> = {
    helios: 'Monitoring physique (CPU/Memory/GPU)',
    harmonia: 'Calibration émotionnelle et tonalité',
    persona: 'Consistance comportementale et modes',
    'memory-core': 'Apprentissage et intégration connaissances',
    watchdog: 'Surveillance sécurité multi-agents',
  };

  return (
    <div className="multi-ai-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🌌 Multi-Agent System Dashboard</h1>
        <div className="global-status">
          <span className={`status-badge ${isRunning ? 'running' : 'stopped'}`}>
            {isRunning ? '● RUNNING' : '○ STOPPED'}
          </span>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="global-metrics">
        <div className="metric-card">
          <div className="metric-label">Cohérence Globale</div>
          <div className="metric-value" style={{ color: getHealthColor(metrics.globalCoherence) }}>
            {metrics.globalCoherence.toFixed(1)}%
          </div>
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${metrics.globalCoherence}%`,
                backgroundColor: getHealthColor(metrics.globalCoherence),
              }}
            />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Stabilité Système</div>
          <div className="metric-value" style={{ color: getHealthColor(metrics.globalStability) }}>
            {metrics.globalStability.toFixed(1)}%
          </div>
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${metrics.globalStability}%`,
                backgroundColor: getHealthColor(metrics.globalStability),
              }}
            />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Charge Globale</div>
          <div className="metric-value" style={{ color: getHealthColor(100 - metrics.globalLoad) }}>
            {metrics.globalLoad.toFixed(1)}%
          </div>
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${metrics.globalLoad}%`,
                backgroundColor: getHealthColor(100 - metrics.globalLoad),
              }}
            />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Erreurs Totales</div>
          <div className="metric-value" style={{ color: metrics.totalErrors > 0 ? '#ef4444' : '#10b981' }}>
            {metrics.totalErrors}
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="agent-grid">
        {Array.from(metrics.agentStates.entries()).map(([agentId, state]) => (
          <div
            key={agentId}
            className={`agent-card ${selectedAgent === agentId ? 'selected' : ''}`}
            onClick={() => setSelectedAgent(agentId === selectedAgent ? null : agentId)}
          >
            {/* Agent Header */}
            <div className="agent-header">
              <div className="agent-icon">{agentIcons[agentId] || '🤖'}</div>
              <div className="agent-info">
                <div className="agent-name">{state.id}</div>
                <div className="agent-description">{agentDescriptions[agentId] || 'Agent IA'}</div>
              </div>
              <div
                className="agent-status-dot"
                style={{ backgroundColor: getStatusColor(state.status) }}
                title={state.status}
              />
            </div>

            {/* Agent Metrics */}
            <div className="agent-metrics">
              <div className="agent-metric">
                <span className="metric-label">Health</span>
                <span className="metric-value" style={{ color: getHealthColor(state.health) }}>
                  {state.health.toFixed(0)}%
                </span>
              </div>
              <div className="agent-metric">
                <span className="metric-label">Load</span>
                <span className="metric-value" style={{ color: getHealthColor(100 - state.load) }}>
                  {state.load.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Health Bar */}
            <div className="agent-health-bar">
              <div
                className="agent-health-fill"
                style={{
                  width: `${state.health}%`,
                  backgroundColor: getHealthColor(state.health),
                }}
              />
            </div>

            {/* Agent Controls (visible when selected) */}
            {selectedAgent === agentId && (
              <div className="agent-controls">
                <button
                  className="control-btn pause"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePauseAgent(agentId);
                  }}
                  disabled={state.status !== 'running'}
                >
                  ⏸️ Pause
                </button>
                <button
                  className="control-btn resume"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResumeAgent(agentId);
                  }}
                  disabled={state.status === 'running'}
                >
                  ▶️ Resume
                </button>
                <button
                  className="control-btn restart"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestartAgent(agentId);
                  }}
                >
                  🔄 Restart
                </button>
              </div>
            )}

            {/* Agent Data Preview */}
            {selectedAgent === agentId && state.data && (
              <div className="agent-data">
                <div className="data-label">État interne:</div>
                <pre className="data-preview">{JSON.stringify(state.data, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* System Info */}
      <div className="system-info">
        <div className="info-section">
          <h3>📊 Statistiques Système</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Agents actifs:</span>
              <span className="info-value">
                {Array.from(metrics.agentStates.values()).filter((s) => s.status === 'running').length} /{' '}
                {metrics.agentStates.size}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Health moyenne:</span>
              <span className="info-value">
                {(
                  Array.from(metrics.agentStates.values()).reduce((sum, s) => sum + s.health, 0) /
                  metrics.agentStates.size
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Load moyenne:</span>
              <span className="info-value">
                {(
                  Array.from(metrics.agentStates.values()).reduce((sum, s) => sum + s.load, 0) /
                  metrics.agentStates.size
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>🔔 Alertes Récentes</h3>
          <div className="alerts-list">
            {metrics.totalErrors === 0 ? (
              <div className="alert-item success">✅ Aucune erreur détectée</div>
            ) : (
              <div className="alert-item warning">⚠️ {metrics.totalErrors} erreurs détectées</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .multi-ai-dashboard {
          padding: 24px;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          min-height: 100vh;
          color: #e0e0e0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .status-badge.running {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 2px solid #10b981;
        }

        .status-badge.stopped {
          background: rgba(107, 114, 128, 0.2);
          color: #6b7280;
          border: 2px solid #6b7280;
        }

        .global-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: rgba(30, 30, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
        }

        .metric-label {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .metric-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .metric-bar-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .agent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .agent-card {
          background: rgba(30, 30, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .agent-card:hover {
          border-color: rgba(102, 126, 234, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        }

        .agent-card.selected {
          border-color: #667eea;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .agent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .agent-icon {
          font-size: 32px;
        }

        .agent-info {
          flex: 1;
        }

        .agent-name {
          font-size: 18px;
          font-weight: 600;
          color: #e0e0e0;
        }

        .agent-description {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .agent-status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
        }

        .agent-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .agent-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .agent-metric .metric-label {
          font-size: 12px;
          color: #9ca3af;
        }

        .agent-metric .metric-value {
          font-size: 18px;
          font-weight: 600;
        }

        .agent-health-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .agent-health-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 3px;
        }

        .agent-controls {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .control-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .control-btn.pause {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .control-btn.resume {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .control-btn.restart {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .control-btn:not(:disabled):hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .agent-data {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .data-label {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 8px;
        }

        .data-preview {
          background: rgba(0, 0, 0, 0.3);
          padding: 12px;
          border-radius: 8px;
          font-size: 11px;
          max-height: 200px;
          overflow-y: auto;
          color: #a0aec0;
        }

        .system-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .info-section {
          background: rgba(30, 30, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
        }

        .info-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #e0e0e0;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 14px;
          color: #9ca3af;
        }

        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #e0e0e0;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-item {
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }

        .alert-item.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .alert-item.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
      `}</style>
    </div>
  );
};
