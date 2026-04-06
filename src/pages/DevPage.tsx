/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v29.0.0 — DEV PAGE (Fusion Complete)
 * Centre unifié développement: Dev Mode + ONE CORE + QA & Tests + Orchestration
 *
 * Fusion de 4 modules → 1 module DEV (8 sections)
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { tauriClient } from '@/lib/tauriClient';
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';
import { useDeveloperMode } from '@/features/developer-mode/useDeveloperMode';
import { useOneCore } from '@/features/one-core/useOneCore';
import { useQAMonitoring } from '@/features/qa-monitoring/useQAMonitoring';
import { OnlineDiagnostic } from '@/components/diagnostic/OnlineDiagnostic';
import type {
  QASystemState,
  TestSuite,
  Alert,
  SystemMetrics,
} from '@/features/qa-monitoring/types';
import type { OneCoreState } from '@/features/one-core/types';
// ✨ v25.4.1 - Web Vitals monitoring (planned for future implementation)
// ✨ v25.6.0 - Ultimate Optimization Dashboard (Phase 12)
import { UltimateOptimizationDashboard } from '@/components/optimization/UltimateOptimizationDashboard';
import './DevPage.css';
import { StatsSystemPanels } from './Stats';
// LOCK3 — SYSTEM_HEALTH_POLLING: backend-sourced health truth on DevPage mount
import { startSystemHealthPolling } from '@/services/systemHealthPoller';
import { useSystemHealth } from '@/stores/systemStore.selectors';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type SectionId = 'overview' | 'diagnostics' | 'operations' | 'validation' | 'security';

const VALID_SECTIONS: SectionId[] = [
  'overview',
  'diagnostics',
  'operations',
  'validation',
  'security',
];

const isSectionId = (value: string | null): value is SectionId => {
  return value !== null && VALID_SECTIONS.includes(value as SectionId);
};

interface OrchestrationState {
  multiAi: {
    bestProvider: string;
    globalScore: number;
    autoMode: boolean;
  };
  meta: {
    awareness_level: string;
    system_health: {
      overall_score: number;
    };
  };
  nexus: {
    coherenceScore: number;
    activeNodes: number;
  };
  harmonia: {
    harmonyScore: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatCard = memo<{
  label: string;
  value: string | number;
  icon: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}>(({ label, value, icon, variant = 'info' }) => (
  <div className={`dev-stat-card dev-stat-card--${variant}`}>
    <span className="dev-stat-icon">{icon}</span>
    <div className="dev-stat-content">
      <div className="dev-stat-value">{value}</div>
      <div className="dev-stat-label">{label}</div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

const HealthBar = memo<{ value: number; label: string }>(({ value, label }) => (
  <div className="dev-health-bar">
    <div className="dev-health-bar-header">
      <span className="dev-health-bar-label">{label}</span>
      <span className="dev-health-bar-value">{value.toFixed(1)}%</span>
    </div>
    <div className="dev-health-bar-track">
      <div
        className={`dev-health-bar-fill dev-health-bar-fill--${
          value >= 80 ? 'success' : value >= 50 ? 'warning' : 'error'
        }`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
));
HealthBar.displayName = 'HealthBar';

// ═══════════════════════════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

// SECTION 1: Overview
const OverviewSection = memo<{
  oneCoreState: OneCoreState | null;
  qaState: QASystemState | null;
  orchestration: OrchestrationState | null;
  // LOCK3: backend-sourced health truth (null = not yet fetched)
  backendHealth: import('../services/tauri/backend-v17.2.types').HealthStatus | null;
}>(({ oneCoreState, qaState, orchestration, backendHealth }) => {
  const globalHealth = oneCoreState
    ? Math.round(
        (oneCoreState.global_health * 100 +
          (qaState?.health_score || 0) +
          (orchestration?.meta?.system_health?.overall_score ?? 0) * 100) /
          3
      )
    : 0;

  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>🎯 Vue d&apos;Ensemble DEV</h2>
      </header>

      <div className="dev-stats-grid">
        <StatCard
          label="Santé Globale"
          value={`${globalHealth}%`}
          icon="💚"
          variant={
            globalHealth >= 80 ? 'success' : globalHealth >= 50 ? 'warning' : 'error'
          }
        />
        <StatCard
          label="ONE CORE"
          value={oneCoreState?.codename || 'N/A'}
          icon="🎯"
          variant={(oneCoreState?.global_health ?? 0) >= 0.8 ? 'success' : 'warning'}
        />
        <StatCard
          label="QA Score"
          value={qaState ? `${qaState.health_score.toFixed(1)}%` : 'N/A'}
          icon="🧪"
          variant={
            qaState && qaState.health_score >= 90
              ? 'success'
              : qaState && qaState.health_score >= 70
                ? 'warning'
                : 'error'
          }
        />
        <StatCard
          label="Orchestration"
          value={orchestration?.multiAi.bestProvider || 'N/A'}
          icon="🔥"
          variant="info"
        />
        <StatCard
          label="Engines Actifs"
          value={oneCoreState?.active_engines || 0}
          icon="⚙️"
          variant="info"
        />
        <StatCard
          label="Alertes"
          value={qaState?.active_alerts || 0}
          icon="🔔"
          variant={qaState && qaState.active_alerts > 0 ? 'warning' : 'success'}
        />
        {/* LOCK3: backend-sourced health truth badge */}
        <StatCard
          label="Santé Backend"
          value={backendHealth ?? '…'}
          icon={
            backendHealth === 'Healthy'
              ? '✅'
              : backendHealth === 'Warning'
                ? '⚠️'
                : backendHealth === 'Critical'
                  ? '🔴'
                  : '⏳'
          }
          variant={
            backendHealth === 'Healthy'
              ? 'success'
              : backendHealth === 'Warning'
                ? 'warning'
                : backendHealth === 'Critical'
                  ? 'error'
                  : 'info'
          }
          data-testid="system-health-backend"
        />
      </div>

      {oneCoreState && (
        <div className="dev-consciousness-section">
          <h3>🧠 Conscience Système</h3>
          <div className="dev-consciousness-grid">
            <div className="dev-consciousness-card">
              <span className="dev-consciousness-label">Niveau</span>
              <span className="dev-consciousness-value">
                {oneCoreState.consciousness_level}
              </span>
            </div>
            <div className="dev-consciousness-card">
              <span className="dev-consciousness-label">Cohérence</span>
              <span className="dev-consciousness-value">
                {(oneCoreState.coherence_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="dev-consciousness-card">
              <span className="dev-consciousness-label">Mode</span>
              <span className="dev-consciousness-value">{oneCoreState.mode}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
OverviewSection.displayName = 'OverviewSection';

// SECTION 2: Dev Tools
const DevToolsSection = memo<{
  onExecute: (command: string) => void;
}>(({ onExecute }) => {
  const _devMode = useDeveloperMode();
  const [selectedOperation, setSelectedOperation] = useState<string>('patch');

  const operations = [
    { id: 'patch', name: 'Patch', icon: '🩹', desc: 'Correction rapide' },
    { id: 'refactor', name: 'Refactor', icon: '🔧', desc: 'Amélioration code' },
    { id: 'rewrite', name: 'Rewrite', icon: '✏️', desc: 'Réécriture complète' },
    { id: 'audit', name: 'Audit', icon: '🔍', desc: 'Audit qualité/sécu' },
    { id: 'test', name: 'Test', icon: '🧪', desc: 'Tests validation' },
    { id: 'rollback', name: 'Rollback', icon: '⏮️', desc: 'Restauration' },
  ];

  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>💻 Dev Tools</h2>
      </header>

      <div className="dev-operations-grid">
        {operations.map(op => (
          <button
            key={op.id}
            data-testid={`btn-dev-operation-${op.id}`}
            className={`dev-operation-card ${selectedOperation === op.id ? 'dev-operation-card--active' : ''}`}
            onClick={() => setSelectedOperation(op.id)}
          >
            <span className="dev-operation-icon">{op.icon}</span>
            <span className="dev-operation-name">{op.name}</span>
            <span className="dev-operation-desc">{op.desc}</span>
          </button>
        ))}
      </div>

      <div className="dev-operation-panel">
        <h3>{operations.find(op => op.id === selectedOperation)?.name} Operation</h3>
        <p className="dev-operation-info">
          Utilisez DevModeEngine pour exécuter des opérations de développement avancées.
        </p>
        <button
          className="dev-btn dev-btn--primary"
          data-testid="btn-dev-execute-operation"
          onClick={() => onExecute(selectedOperation)}
        >
          Exécuter {operations.find(op => op.id === selectedOperation)?.name}
        </button>
      </div>
    </div>
  );
});
DevToolsSection.displayName = 'DevToolsSection';

// SECTION 3: Command Center
const CommandCenterSection = memo<{
  state: OneCoreState | null;
}>(({ state }) => {
  if (!state) return <div className="dev-section">Chargement...</div>;

  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>🎯 Command Center</h2>
        <span className="dev-version">ONE CORE {state.version}</span>
      </header>

      <div className="dev-centers-grid">
        {state.centers.map((center, i) => (
          <div key={i} className="dev-center-card">
            <div className="dev-center-header">
              <span className="dev-center-name">{center.name}</span>
              <span className="dev-center-category">{center.category}</span>
            </div>
            <HealthBar value={center.global_health * 100} label="Santé" />
            <div className="dev-center-stats">
              <div className="dev-center-stat">
                <span className="dev-center-stat-value">{center.active_engines}</span>
                <span className="dev-center-stat-label">
                  / {center.engines_count} engines
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
CommandCenterSection.displayName = 'CommandCenterSection';

// SECTION 4: System Commands
const SystemCommandsSection = memo<{
  onExecute: (command: string) => void;
}>(({ onExecute }) => {
  const commands = [
    { id: 'sync_all', name: 'Sync All', icon: '🔄', category: 'System', danger: false },
    {
      id: 'health_check',
      name: 'Health Check',
      icon: '🏥',
      category: 'System',
      danger: false,
    },
    {
      id: 'optimize',
      name: 'Optimize',
      icon: '⚡',
      category: 'Maintenance',
      danger: false,
    },
    { id: 'repair', name: 'Repair', icon: '🔧', category: 'Maintenance', danger: false },
    {
      id: 'gc',
      name: 'Garbage Collect',
      icon: '🗑️',
      category: 'Maintenance',
      danger: false,
    },
    { id: 'backup', name: 'Backup', icon: '💾', category: 'Advanced', danger: false },
  ];

  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>📊 System Commands</h2>
      </header>

      <div className="dev-commands-grid">
        {commands.map(cmd => (
          <button
            key={cmd.id}
            data-testid={`btn-dev-command-${cmd.id}`}
            className={`dev-command-btn ${cmd.danger ? 'dev-command-btn--danger' : 'dev-command-btn--primary'}`}
            onClick={() => onExecute(cmd.id)}
          >
            <span className="dev-command-icon">{cmd.icon}</span>
            <span className="dev-command-name">{cmd.name}</span>
            <span className="dev-command-category">{cmd.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
SystemCommandsSection.displayName = 'SystemCommandsSection';

// SECTION 5: QA & Tests
const QATestsSection = memo<{
  state: QASystemState | null;
  suites: TestSuite[];
  onRunSuite: (suiteId: string) => void;
}>(({ state, suites, onRunSuite }) => {
  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>🧪 QA & Tests</h2>
      </header>

      {state && (
        <div className="dev-qa-stats">
          <StatCard
            label="Couverture Tests"
            value={`${state.test_coverage.toFixed(1)}%`}
            icon="📊"
            variant={
              state.test_coverage >= 80
                ? 'success'
                : state.test_coverage >= 60
                  ? 'warning'
                  : 'error'
            }
          />
          <StatCard
            label="Moniteurs Actifs"
            value={state.active_monitors}
            icon="📊"
            variant="info"
          />
          <StatCard
            label="Hardening"
            value={state.hardening_level}
            icon="🛡️"
            variant="info"
          />
        </div>
      )}

      <div className="dev-suites-list">
        {suites.map(suite => (
          <div key={suite.id} className="dev-suite-card">
            <div className="dev-suite-header">
              <span className="dev-suite-name">{suite.name}</span>
              <span className="dev-suite-category">{suite.category}</span>
            </div>
            <div className="dev-suite-stats">
              <span className="dev-suite-stat dev-suite-stat--success">
                ✓ {suite.passed}
              </span>
              <span className="dev-suite-stat dev-suite-stat--error">
                ✗ {suite.failed}
              </span>
              <span className="dev-suite-stat dev-suite-stat--info">
                ○ {suite.skipped}
              </span>
            </div>
            <button
              className="dev-btn dev-btn--small dev-btn--primary"
              data-testid={`btn-dev-run-suite-${suite.id}`}
              onClick={() => onRunSuite(suite.id)}
            >
              Exécuter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
QATestsSection.displayName = 'QATestsSection';

// SECTION 6: Orchestration
const OrchestrationSection = memo<{
  state: OrchestrationState | null;
}>(({ state }) => {
  if (!state) return <div className="dev-section">Chargement orchestration...</div>;

  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>🔥 Orchestration & IA</h2>
      </header>

      <div className="dev-orchestration-cards">
        <div className="dev-orch-card">
          <h3>🤖 Multi-AI</h3>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Best Provider</span>
            <span className="dev-orch-value">{state.multiAi.bestProvider}</span>
          </div>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Score Global</span>
            <span className="dev-orch-value">{state.multiAi.globalScore}%</span>
          </div>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Mode Auto</span>
            <span className="dev-orch-value">
              {state.multiAi.autoMode ? '✓ Activé' : '✗ Désactivé'}
            </span>
          </div>
        </div>

        <div className="dev-orch-card">
          <h3>🧠 Nexus</h3>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Cohérence</span>
            <span className="dev-orch-value">{state.nexus.coherenceScore}%</span>
          </div>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Nœuds Actifs</span>
            <span className="dev-orch-value">{state.nexus.activeNodes}</span>
          </div>
        </div>

        <div className="dev-orch-card">
          <h3>⚖️ Harmonia</h3>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Harmonie</span>
            <span className="dev-orch-value">{state.harmonia.harmonyScore}%</span>
          </div>
        </div>

        <div className="dev-orch-card">
          <h3>🎛️ Meta</h3>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Awareness</span>
            {/* v29.0: optional chaining — state.meta peut être absent si IPC partiel */}
            <span className="dev-orch-value">{state.meta?.awareness_level ?? 'N/A'}</span>
          </div>
          <div className="dev-orch-stat">
            <span className="dev-orch-label">Health</span>
            <span className="dev-orch-value">
              {((state.meta?.system_health?.overall_score ?? 0) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
OrchestrationSection.displayName = 'OrchestrationSection';

// SECTION 7: Security
const SecuritySection = memo<{
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}>(({ alerts, onAcknowledge }) => {
  const criticalAlerts = alerts.filter(a => !a.resolved && a.severity === 'critical');
  const warningAlerts = alerts.filter(a => !a.resolved && a.severity === 'warning');

  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>🛡️ Security & Alerts</h2>
      </header>

      <div className="dev-security-stats">
        <StatCard
          label="Alertes Critiques"
          value={criticalAlerts.length}
          icon="🔴"
          variant={criticalAlerts.length > 0 ? 'error' : 'success'}
        />
        <StatCard
          label="Avertissements"
          value={warningAlerts.length}
          icon="🟡"
          variant={warningAlerts.length > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="dev-alerts-list">
        {alerts
          .filter(a => !a.resolved)
          .map(alert => (
            <div key={alert.id} className={`dev-alert dev-alert--${alert.severity}`}>
              <div className="dev-alert-header">
                <span className="dev-alert-name">{alert.source}</span>
                <span className="dev-alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="dev-alert-message">{alert.message}</p>
              <button
                className="dev-btn dev-btn--small"
                data-testid={`btn-dev-ack-alert-${alert.id}`}
                onClick={() => onAcknowledge(alert.id)}
              >
                Acquitter
              </button>
            </div>
          ))}
        {alerts.filter(a => !a.resolved).length === 0 && (
          <div className="dev-empty">✓ Aucune alerte active</div>
        )}
      </div>
    </div>
  );
});
SecuritySection.displayName = 'SecuritySection';

// SECTION 8: Metrics & Diagnostics
const MetricsSection = memo<{
  metrics: SystemMetrics | null;
  oneCoreMetrics: OneCoreState | null;
}>(({ metrics, oneCoreMetrics }) => {
  return (
    <div className="dev-section">
      <header className="dev-section-header">
        <h2>📈 Metrics & Diagnostics</h2>
      </header>

      {/* v29.0: Web Vitals — DISPLAY_ONLY, monitoring IPC non câblé */}
      <div className="dev-performance-vitals">
        <h3>⚡ Core Web Vitals</h3>
        <p
          className="dev-coming-soon"
          style={{ color: 'rgba(203,213,225,0.6)', fontSize: '0.8rem' }}
        >
          Monitoring Web Vitals non disponible — nécessite intégration IPC
          system_metrics_live (DISPLAY_ONLY)
        </p>
      </div>

      {metrics && (
        <div className="dev-metrics-grid">
          <div className="dev-metric-card">
            <h3>CPU Usage</h3>
            <HealthBar value={metrics.cpu_usage} label="CPU" />
          </div>
          <div className="dev-metric-card">
            <h3>Memory Usage</h3>
            <HealthBar value={metrics.memory_usage} label="RAM" />
          </div>
          <div className="dev-metric-card">
            <h3>Disk Usage</h3>
            <HealthBar value={metrics.disk_usage} label="Disk" />
          </div>
        </div>
      )}

      {oneCoreMetrics && (
        <div className="dev-uptime-section">
          <h3>⏱️ System Uptime</h3>
          <div className="dev-uptime-value">
            {Math.floor(oneCoreMetrics.uptime_seconds / 3600)}h{' '}
            {Math.floor((oneCoreMetrics.uptime_seconds % 3600) / 60)}m
          </div>
        </div>
      )}
    </div>
  );
});
MetricsSection.displayName = 'MetricsSection';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function DevPageContent(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    const requestedSection = searchParams.get('tab');
    return isSectionId(requestedSection) ? requestedSection : 'overview';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const oneCore = useOneCore();
  const qa = useQAMonitoring();
  // LOCK3 — SYSTEM_HEALTH_POLLING: backend health truth (replaces static guesses)
  const backendHealth = useSystemHealth();

  useEffect(() => {
    const poller = startSystemHealthPolling(10_000);
    return () => poller.stop();
  }, []);

  // States
  const [oneCoreState, setOneCoreState] = useState<OneCoreState | null>(null);
  const [qaState, setQAState] = useState<QASystemState | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [orchestration, setOrchestration] = useState<OrchestrationState | null>(null);
  const [orchestrationDegraded, setOrchestrationDegraded] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [qaStateData, metricsData, suitesData, alertsData] = await Promise.all([
        qa.getState(),
        qa.getSystemMetrics(),
        qa.listTestSuites(),
        qa.listAlerts(false),
      ]);

      // oneCore.state est déjà une propriété (pas getState())
      setOneCoreState(oneCore.state);
      setQAState(qaStateData);
      setMetrics(metricsData);
      setSuites(suitesData);
      setAlerts(alertsData);

      // Load orchestration state
      try {
        const orchState =
          (await tauriClient.orchestrationGetUnifiedState()) as OrchestrationState;
        setOrchestration(orchState);
        setOrchestrationDegraded(false);
      } catch {
        // Fallback: données statiques — affichage dégradé signalé dans l'UI
        setOrchestrationDegraded(true);
        setOrchestration({
          multiAi: {
            bestProvider: 'claude',
            globalScore: 87,
            autoMode: true,
          },
          meta: {
            awareness_level: 'high',
            system_health: {
              overall_score: 0.89,
            },
          },
          nexus: {
            coherenceScore: 92,
            activeNodes: 12,
          },
          harmonia: {
            harmonyScore: 85,
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      logger.error(
        'DEV page data loading failed',
        { component: 'DevPage' },
        err as Error
      );
    } finally {
      setLoading(false);
    }
  }, [oneCore, qa]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateActiveSection = useCallback(
    (nextSection: SectionId) => {
      setActiveSection(nextSection);
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          next.set('tab', nextSection);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    const requestedSection = searchParams.get('tab');
    if (isSectionId(requestedSection) && requestedSection !== activeSection) {
      setActiveSection(requestedSection);
    }
  }, [activeSection, searchParams]);

  // Handlers
  const handleExecuteCommand = useCallback(
    async (command: string) => {
      try {
        await oneCore.executeCommand(command);
        await loadData();
      } catch (err) {
        logger.error(
          'Command execution failed',
          { component: 'DevPage', command },
          err as Error
        );
      }
    },
    [oneCore, loadData]
  );

  const handleRunSuite = useCallback(
    async (suiteId: string) => {
      try {
        await qa.runTestSuite(suiteId);
        await loadData();
      } catch (err) {
        logger.error(
          'Test suite execution failed',
          { component: 'DevPage', suiteId },
          err as Error
        );
      }
    },
    [qa, loadData]
  );

  const handleAcknowledgeAlert = useCallback(
    async (alertId: string) => {
      try {
        await qa.acknowledgeAlert(alertId);
        await loadData();
      } catch (err) {
        logger.error(
          'Alert acknowledgement failed',
          { component: 'DevPage', alertId },
          err as Error
        );
      }
    },
    [qa, loadData]
  );

  if (loading) {
    return (
      <div className="dev-page">
        <div className="dev-loading">
          <span className="dev-loading-icon">⚙️</span>
          <span className="dev-loading-text">Chargement DEV...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dev-page">
        <div className="dev-error">
          <span className="dev-error-icon">⚠️</span>
          <span>{error}</span>
          <button className="dev-btn dev-btn--primary" onClick={loadData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview' as const, label: "Vue d'ensemble", icon: '🎯' },
    { id: 'diagnostics' as const, label: 'Diagnostics', icon: '🌐' },
    { id: 'operations' as const, label: 'Opérations', icon: '⚙️' },
    { id: 'validation' as const, label: 'Validation', icon: '🧪' },
    { id: 'security' as const, label: 'Security', icon: '🛡️' },
  ];

  return (
    <div className="dev-page" data-testid="page-dev">
      <header className="dev-header">
        <div className="dev-header-content">
          <h1>🔧 DEV Cockpit</h1>
          <span className="dev-version">TITANE∞ v29.0.0 • 5 tabs fusionnés</span>
        </div>
        <button
          className="dev-btn dev-btn--primary"
          data-testid="btn-dev-refresh"
          onClick={loadData}
        >
          🔄 Rafraîchir
        </button>
      </header>

      <nav className="dev-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            data-testid={`tab-dev-${section.id}`}
            className={`dev-tab ${activeSection === section.id ? 'dev-tab--active' : ''}`}
            onClick={() => updateActiveSection(section.id)}
          >
            <span className="dev-tab-icon">{section.icon}</span>
            <span className="dev-tab-label">{section.label}</span>
          </button>
        ))}
      </nav>

      <main className="dev-main">
        {activeSection === 'overview' && (
          <OverviewSection
            oneCoreState={oneCoreState}
            qaState={qaState}
            orchestration={orchestration}
            backendHealth={backendHealth}
          />
        )}
        {/* v29.0: Diagnostics = Diagnostic Online + Metrics + Stats Moteurs + Orchestration */}
        {activeSection === 'diagnostics' && (
          <div data-testid="page-dev-diagnostics" className="dev-fusion-section">
            <div data-testid="page-dev-diagnostic">
              <OnlineDiagnostic />
            </div>
            <MetricsSection metrics={metrics} oneCoreMetrics={oneCoreState} />
            {/* v29.1: STATS fusionné ici — Nexus · Helios · Harmonia · Cognitif */}
            <div className="dev-section" data-testid="page-dev-stats-panels">
              <header className="dev-section-header">
                <h2>📊 Métriques Moteurs</h2>
                <span className="dev-version">Nexus · Helios · Harmonia · Cognitif</span>
              </header>
              <StatsSystemPanels />
            </div>
            {orchestrationDegraded && (
              <div
                role="alert"
                style={{
                  padding: '6px 10px',
                  marginBottom: '8px',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.4)',
                  borderRadius: '6px',
                  color: '#f59e0b',
                  fontSize: '0.8rem',
                }}
              >
                ⚠️ Orchestration — données statiques (IPC indisponible)
              </div>
            )}
            <OrchestrationSection state={orchestration} />
          </div>
        )}
        {/* v29.0: Operations = Dev Tools + Command Center + System Commands + Optimization */}
        {activeSection === 'operations' && (
          <div data-testid="page-dev-operations" className="dev-fusion-section">
            <SystemCommandsSection onExecute={handleExecuteCommand} />
            <CommandCenterSection state={oneCoreState} />
            <DevToolsSection onExecute={handleExecuteCommand} />
            <div className="dev-section">
              <UltimateOptimizationDashboard />
            </div>
          </div>
        )}
        {/* v29.0: Validation = QA & Tests */}
        {activeSection === 'validation' && (
          <QATestsSection state={qaState} suites={suites} onRunSuite={handleRunSuite} />
        )}
        {activeSection === 'security' && (
          <SecuritySection alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
        )}
      </main>
    </div>
  );
}

// Export with ErrorBoundary
export const DevPage: React.FC = memo(() => {
  return (
    <ErrorBoundary context="DevPage">
      <DevPageContent />
    </ErrorBoundary>
  );
});
DevPage.displayName = 'DevPage';

export default DevPage;
