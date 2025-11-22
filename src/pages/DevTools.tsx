/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v24 — DEVTOOLS PAGE (HUD Cognitif + Living Engines)
 *   Monitoring Avancé avec 13 Moteurs Vivants temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { MonitoringHeader } from '../components/monitoring/MonitoringHeader';
import { SystemStatusCard, SystemStatus } from '../components/monitoring/SystemStatusCard';
import { LogsCard } from '../components/monitoring/LogsCard';
import { ErrorsCard } from '../components/monitoring/ErrorsCard';
import { CognitiveModuleCard } from '../components/monitoring/CognitiveModuleCard';
import { LivingEnginesCard } from '../components/monitoring/LivingEnginesCard';
import { useTitaneCore } from '../hooks';
import { useLivingEngines } from '../hooks';
import { extractString } from '../utils/dataUtils';
import './DevTools.v20.css';
import '../design-system/titane-v20.css';

export const DevTools = () => {
  const { systemStatus, error } = useTitaneCore();
  
  // 🌟 Living Engines Integration v21-v24
  const livingEngines = useLivingEngines(100);
  
  const [logs, setLogs] = useState<string[]>([
    '[INFO] System initialized',
    '[DEBUG] All modules loaded',
    '[INFO] Frontend connected',
    '[INFO] 🌟 Living Engines v21-v24 activated',
  ]);
  const [activeTab, setActiveTab] = useState<'system' | 'logs' | 'performance'>('system');
  const [debugMode, setDebugMode] = useState(false);

  // Living module metrics (dynamic from engines)
  const moduleMetrics = {
    helios: { 
      value: Math.round(livingEngines.state.cognitiveLoad * 100), 
      label: 'Charge Cognitive', 
      status: livingEngines.state.cognitiveLoad > 0.8 ? 'critical' as const : 'stable' as const 
    },
    nexus: { 
      value: Math.round(livingEngines.state.rhythmScore * 100), 
      label: 'Rythme Système', 
      status: 'active' as const 
    },
    harmonia: { 
      value: Math.round(livingEngines.state.presenceLevel * 100), 
      label: 'Présence Persona', 
      status: 'stable' as const 
    },
    memory: { 
      value: Math.round((livingEngines.state.glow - 0.5) * 100 + 50), 
      label: 'Intensité Glow', 
      status: 'stable' as const 
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const personaMood = livingEngines.state.persona?.mood.current || 'neutre';
      setLogs((prev) => [
        ...prev,
        `[DEBUG] System tick at ${new Date().toLocaleTimeString()} | Mood: ${personaMood}`,
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, [livingEngines.state.persona]);

  const systemStatusStr = extractString(systemStatus, 'Unknown');
  const errorStr = extractString(error, 'No errors');
  const errorCount = error ? 3 : 0;

  // Determine system status
  const getSystemStatus = (): SystemStatus => {
    if (error) return 'critical';
    if (moduleMetrics.helios.value > 80) return 'warning';
    if (moduleMetrics.harmonia.value > 85) return 'stable';
    return 'attention';
  };

  return (
    <div className="devtools-page">
      {/* Header */}
      <MonitoringHeader
        onDebugClick={() => setDebugMode(!debugMode)}
        debugActive={debugMode}
      />

      {/* Cards Grid — Overview */}
      <div className="devtools-grid devtools-grid--cards">
        <LogsCard
          totalLogs={logs.length}
          recentLogs={logs.slice(-5).reverse()}
          onViewAll={() => setActiveTab('logs')}
        />

        <SystemStatusCard
          status={getSystemStatus()}
          subtitle="Statut global"
          lastUpdate={new Date().toLocaleTimeString()}
          metrics={{
            cpu: moduleMetrics.helios.value,
            memory: moduleMetrics.memory.value,
            uptime: '2h 34m'
          }}
        />

        <ErrorsCard
          errorCount={errorCount}
          latestError={error ? String(error) : undefined}
          errorType={error ? 'critical' : 'info'}
        />
      </div>

      {/* 🌟 Living Engines Card - NEW v24 */}
      <div className="devtools-section" style={{ marginTop: '2rem' }}>
        <LivingEnginesCard state={livingEngines.state} />
      </div>

      {/* Cognitive Modules HUD */}
      <div className="devtools-section">
        <div className="devtools-section__header">
          <h2 className="devtools-section__title">HUD Cognitif — Modules TITANE∞</h2>
          <p className="devtools-section__subtitle">
            Surveillance temps réel des modules intelligents avec visualisation data-driven
          </p>
        </div>

        <div className="devtools-grid devtools-grid--modules">
          <CognitiveModuleCard
            module="helios"
            value={moduleMetrics.helios.value}
            label={moduleMetrics.helios.label}
            status={moduleMetrics.helios.status}
            subtitle="Température optimale"
          />

          <CognitiveModuleCard
            module="nexus"
            value={moduleMetrics.nexus.value}
            label={moduleMetrics.nexus.label}
            status={moduleMetrics.nexus.status}
            subtitle="Réseau stable"
          />

          <CognitiveModuleCard
            module="harmonia"
            value={moduleMetrics.harmonia.value}
            label={moduleMetrics.harmonia.label}
            status={moduleMetrics.harmonia.status}
            subtitle="Parfait équilibre"
          />

          <CognitiveModuleCard
            module="memory"
            value={moduleMetrics.memory.value}
            label={moduleMetrics.memory.label}
            status={moduleMetrics.memory.status}
            subtitle="Couches optimisées"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="devtools-tabs">
        {(['system', 'logs', 'performance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`devtools-tab ${activeTab === tab ? 'devtools-tab--active' : ''}`}
          >
            {tab === 'system' ? '🖥️ Système' : tab === 'logs' ? '📋 Logs' : '⚡ Performance'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="devtools-panel">
        {activeTab === 'system' && (
          <div className="devtools-panel__content">
            <div className="devtools-panel__header">
              <h3 className="devtools-panel__title">État du Système</h3>
              <span className="devtools-panel__badge devtools-panel__badge--success">
                Actif
              </span>
            </div>
            <div className="devtools-code-block">
              <pre>{typeof systemStatus === 'object' ? JSON.stringify(systemStatus, null, 2) : String(systemStatus)}</pre>
            </div>
            {error && (
              <div className="devtools-alert devtools-alert--error">
                <div className="devtools-alert__icon">⚠️</div>
                <div className="devtools-alert__content">
                  <div className="devtools-alert__title">Erreur Détectée</div>
                  <div className="devtools-alert__message">{String(error)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="devtools-panel__content">
            <div className="devtools-panel__header">
              <h3 className="devtools-panel__title">Logs Système</h3>
              <span className="devtools-panel__count">{logs.length} entrées</span>
            </div>
            <div className="devtools-logs">
              {logs.slice().reverse().map((log, i) => (
                <div
                  key={i}
                  className={`devtools-log-item ${
                    log.includes('[ERROR]') ? 'devtools-log-item--error' :
                    log.includes('[WARN]') ? 'devtools-log-item--warning' :
                    'devtools-log-item--info'
                  }`}
                >
                  <span className="devtools-log-item__dot" />
                  <span className="devtools-log-item__text">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="devtools-panel__content">
            <div className="devtools-panel__header">
              <h3 className="devtools-panel__title">Métriques de Performance</h3>
            </div>
            <div className="devtools-metrics-grid">
              <div className="devtools-metric-card devtools-metric-card--success">
                <div className="devtools-metric-card__label">CPU Usage</div>
                <div className="devtools-metric-card__value">{moduleMetrics.helios.value}%</div>
                <div className="devtools-metric-card__bar">
                  <div
                    className="devtools-metric-card__bar-fill"
                    style={{ width: `${moduleMetrics.helios.value}%` }}
                  />
                </div>
              </div>

              <div className="devtools-metric-card devtools-metric-card--info">
                <div className="devtools-metric-card__label">Memory Usage</div>
                <div className="devtools-metric-card__value">{moduleMetrics.memory.value}%</div>
                <div className="devtools-metric-card__bar">
                  <div
                    className="devtools-metric-card__bar-fill"
                    style={{ width: `${moduleMetrics.memory.value}%` }}
                  />
                </div>
              </div>

              <div className="devtools-metric-card devtools-metric-card--primary">
                <div className="devtools-metric-card__label">Network Activity</div>
                <div className="devtools-metric-card__value">{moduleMetrics.nexus.value}%</div>
                <div className="devtools-metric-card__bar">
                  <div
                    className="devtools-metric-card__bar-fill"
                    style={{ width: `${moduleMetrics.nexus.value}%` }}
                  />
                </div>
              </div>

              <div className="devtools-metric-card devtools-metric-card--success">
                <div className="devtools-metric-card__label">System Balance</div>
                <div className="devtools-metric-card__value">{moduleMetrics.harmonia.value}%</div>
                <div className="devtools-metric-card__bar">
                  <div
                    className="devtools-metric-card__bar-fill"
                    style={{ width: `${moduleMetrics.harmonia.value}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

