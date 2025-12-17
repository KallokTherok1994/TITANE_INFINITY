/**
 * TITANE∞ v24.3.0 — QA Monitoring Center Page
 * © 2025 TITANE Team. All rights reserved.
 * v22Ω AI Performance Optimizations Compatible
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';
import { useQAMonitoring } from './useQAMonitoring';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import type {
  QASystemState,
  TestSuite,
  TestResult,
  Monitor,
  Alert,
  SystemMetrics,
  HardeningConfig,
  SecurityAuditResult,
  PerformanceReport,
  LogEntry,
} from './types';
import './QAMonitoringPage.css';

// ============================================================================
// Helper Components
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

const StatCard = React.memo(
  ({ label, value, icon, variant = 'info' }: StatCardProps): JSX.Element => (
    <div className={`qa-stat-card qa-stat-card--${variant}`}>
      <span className="qa-stat-icon">{icon}</span>
      <div className="qa-stat-content">
        <span className="qa-stat-value">{value}</span>
        <span className="qa-stat-label">{label}</span>
      </div>
    </div>
  )
);

interface SeverityBadgeProps {
  severity: string;
}

const SeverityBadge = React.memo(
  ({ severity }: SeverityBadgeProps): JSX.Element => (
    <span className={`qa-severity qa-severity--${severity}`}>
      {severity.toUpperCase()}
    </span>
  )
);

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = React.memo(
  ({ status }: StatusBadgeProps): JSX.Element => (
    <span className={`qa-status qa-status--${status}`}>{status}</span>
  )
);

// ============================================================================
// Tab Components
// ============================================================================

interface OverviewTabProps {
  state: QASystemState | null;
  metrics: SystemMetrics | null;
  alerts: Alert[];
  onRefresh: () => void;
}

const OverviewTab = ({
  state,
  metrics,
  alerts,
  onRefresh,
}: OverviewTabProps): JSX.Element => {
  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="qa-tab-content">
      <div className="qa-section-header">
        <h2>🎯 Vue d'ensemble QA</h2>
        <button className="qa-btn qa-btn--primary" onClick={onRefresh}>
          🔄 Rafraîchir
        </button>
      </div>

      {state && (
        <div className="qa-stats-grid">
          <StatCard
            label="Score Santé"
            value={`${state.health_score.toFixed(1)}%`}
            icon="💚"
            variant={
              state.health_score >= 90
                ? 'success'
                : state.health_score >= 70
                  ? 'warning'
                  : 'error'
            }
          />
          <StatCard
            label="Couverture Tests"
            value={`${state.test_coverage.toFixed(1)}%`}
            icon="🧪"
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
            label="Alertes Actives"
            value={activeAlerts.length}
            icon="🔔"
            variant={
              activeAlerts.length === 0
                ? 'success'
                : activeAlerts.some(a => a.severity === 'critical')
                  ? 'error'
                  : 'warning'
            }
          />
          <StatCard
            label="Niveau Hardening"
            value={state.hardening_level}
            icon="🛡️"
            variant="info"
          />
          <StatCard
            label="Uptime"
            value={`${Math.floor(state.uptime_seconds / 3600)}h`}
            icon="⏱️"
            variant="success"
          />
        </div>
      )}

      {metrics && (
        <div className="qa-metrics-section">
          <h3>📈 Métriques Système</h3>
          <div className="qa-metrics-grid">
            <div className="qa-metric">
              <span className="qa-metric-label">CPU</span>
              <div className="qa-progress-bar">
                <div
                  className={`qa-progress-fill qa-progress-fill--${metrics.cpu_usage > 80 ? 'error' : metrics.cpu_usage > 60 ? 'warning' : 'success'}`}
                  style={{ width: `${metrics.cpu_usage}%` }}
                />
              </div>
              <span className="qa-metric-value">{metrics.cpu_usage.toFixed(1)}%</span>
            </div>
            <div className="qa-metric">
              <span className="qa-metric-label">Mémoire</span>
              <div className="qa-progress-bar">
                <div
                  className={`qa-progress-fill qa-progress-fill--${metrics.memory_usage > 85 ? 'error' : metrics.memory_usage > 70 ? 'warning' : 'success'}`}
                  style={{ width: `${metrics.memory_usage}%` }}
                />
              </div>
              <span className="qa-metric-value">{metrics.memory_usage.toFixed(1)}%</span>
            </div>
            <div className="qa-metric">
              <span className="qa-metric-label">Disque</span>
              <div className="qa-progress-bar">
                <div
                  className={`qa-progress-fill qa-progress-fill--${metrics.disk_usage > 90 ? 'error' : metrics.disk_usage > 75 ? 'warning' : 'success'}`}
                  style={{ width: `${metrics.disk_usage}%` }}
                />
              </div>
              <span className="qa-metric-value">{metrics.disk_usage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="qa-alerts-section">
          <h3>⚠️ Alertes Actives</h3>
          <div className="qa-alert-list">
            {activeAlerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={`qa-alert-item qa-alert-item--${alert.severity}`}
              >
                <SeverityBadge severity={alert.severity} />
                <span className="qa-alert-message">{alert.message}</span>
                <span className="qa-alert-source">{alert.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TestsTabProps {
  suites: TestSuite[];
  results: TestResult[];
  onRunSuite: (suiteId: string) => void;
  isRunning: boolean;
}

const TestsTab = ({
  suites,
  results,
  onRunSuite,
  isRunning,
}: TestsTabProps): JSX.Element => {
  return (
    <div className="qa-tab-content">
      <div className="qa-section-header">
        <h2>🧪 Suites de Tests</h2>
      </div>

      <div className="qa-suites-grid">
        {suites.map(suite => (
          <div key={suite.id} className="qa-suite-card">
            <div className="qa-suite-header">
              <h3>{suite.name}</h3>
              <StatusBadge status={suite.category} />
            </div>
            <div className="qa-suite-stats">
              <div className="qa-suite-stat">
                <span className="qa-suite-stat-value">{suite.tests_count}</span>
                <span className="qa-suite-stat-label">Total</span>
              </div>
              <div className="qa-suite-stat qa-suite-stat--success">
                <span className="qa-suite-stat-value">{suite.passed}</span>
                <span className="qa-suite-stat-label">Passés</span>
              </div>
              <div className="qa-suite-stat qa-suite-stat--error">
                <span className="qa-suite-stat-value">{suite.failed}</span>
                <span className="qa-suite-stat-label">Échecs</span>
              </div>
              <div className="qa-suite-stat qa-suite-stat--warning">
                <span className="qa-suite-stat-value">{suite.skipped}</span>
                <span className="qa-suite-stat-label">Ignorés</span>
              </div>
            </div>
            <div className="qa-suite-coverage">
              <span>Couverture: {suite.coverage.toFixed(1)}%</span>
              <div className="qa-progress-bar">
                <div
                  className="qa-progress-fill qa-progress-fill--info"
                  style={{ width: `${suite.coverage}%` }}
                />
              </div>
            </div>
            <button
              className="qa-btn qa-btn--secondary qa-btn--full"
              onClick={() => onRunSuite(suite.id)}
              disabled={isRunning}
            >
              {isRunning ? '⏳ Exécution...' : '▶️ Exécuter'}
            </button>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="qa-results-section">
          <h3>📋 Derniers Résultats</h3>
          <table className="qa-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Suite</th>
                <th>Status</th>
                <th>Durée</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id} className={`qa-row--${result.status}`}>
                  <td>{result.name}</td>
                  <td>{result.suite}</td>
                  <td>
                    <StatusBadge status={result.status} />
                  </td>
                  <td>{result.duration_ms}ms</td>
                  <td>{result.message || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface MonitorsTabProps {
  monitors: Monitor[];
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

const MonitorsTab = ({ monitors, onToggle, onDelete }: MonitorsTabProps): JSX.Element => {
  return (
    <div className="qa-tab-content">
      <div className="qa-section-header">
        <h2>📊 Moniteurs</h2>
      </div>

      <div className="qa-monitors-grid">
        {monitors.map(monitor => (
          <div
            key={monitor.id}
            className={`qa-monitor-card qa-monitor-card--${monitor.status}`}
          >
            <div className="qa-monitor-header">
              <h3>{monitor.name}</h3>
              <StatusBadge status={monitor.status} />
            </div>
            <div className="qa-monitor-target">
              <code>{monitor.target}</code>
            </div>
            <div className="qa-monitor-value">
              <span className="qa-monitor-value-current">
                {monitor.last_value.toFixed(1)}
              </span>
              <span className="qa-monitor-value-thresholds">
                ⚠️ {monitor.threshold_warning} | 🚨 {monitor.threshold_critical}
              </span>
            </div>
            <div className="qa-monitor-interval">Intervalle: {monitor.interval_ms}ms</div>
            <div className="qa-monitor-actions">
              <button
                className={`qa-btn qa-btn--${monitor.status === 'active' ? 'warning' : 'success'} qa-btn--small`}
                onClick={() => onToggle(monitor.id, monitor.status !== 'active')}
              >
                {monitor.status === 'active' ? '⏸️ Pause' : '▶️ Activer'}
              </button>
              <button
                className="qa-btn qa-btn--error qa-btn--small"
                onClick={() => onDelete(monitor.id)}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AlertsTabProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  showResolved: boolean;
  onToggleResolved: () => void;
}

const AlertsTab = ({
  alerts,
  onAcknowledge,
  onResolve,
  showResolved,
  onToggleResolved,
}: AlertsTabProps): JSX.Element => {
  return (
    <div className="qa-tab-content">
      <div className="qa-section-header">
        <h2>🔔 Alertes</h2>
        <label className="qa-toggle-label">
          <input type="checkbox" checked={showResolved} onChange={onToggleResolved} />
          Afficher résolues
        </label>
      </div>

      <div className="qa-alerts-list">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`qa-alert-card qa-alert-card--${alert.severity} ${alert.resolved ? 'qa-alert-card--resolved' : ''}`}
          >
            <div className="qa-alert-header">
              <SeverityBadge severity={alert.severity} />
              <span className="qa-alert-time">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="qa-alert-body">
              <p className="qa-alert-message">{alert.message}</p>
              <span className="qa-alert-source">Source: {alert.source}</span>
            </div>
            <div className="qa-alert-status">
              {alert.acknowledged && (
                <span className="qa-badge qa-badge--info">✓ Acquitté</span>
              )}
              {alert.resolved && (
                <span className="qa-badge qa-badge--success">✓ Résolu</span>
              )}
            </div>
            {!alert.resolved && (
              <div className="qa-alert-actions">
                {!alert.acknowledged && (
                  <button
                    className="qa-btn qa-btn--secondary qa-btn--small"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    ✓ Acquitter
                  </button>
                )}
                <button
                  className="qa-btn qa-btn--success qa-btn--small"
                  onClick={() => onResolve(alert.id)}
                >
                  ✅ Résoudre
                </button>
              </div>
            )}
          </div>
        ))}
        {alerts.length === 0 && <div className="qa-empty">Aucune alerte à afficher</div>}
      </div>
    </div>
  );
};

interface SecurityTabProps {
  config: HardeningConfig | null;
  auditResult: SecurityAuditResult | null;
  onRunAudit: () => void;
  isAuditing: boolean;
}

const SecurityTab = ({
  config,
  auditResult,
  onRunAudit,
  isAuditing,
}: SecurityTabProps): JSX.Element => {
  return (
    <div className="qa-tab-content">
      <div className="qa-section-header">
        <h2>🛡️ Sécurité & Hardening</h2>
        <button
          className="qa-btn qa-btn--primary"
          onClick={onRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? '⏳ Audit en cours...' : '🔍 Lancer Audit'}
        </button>
      </div>

      {config && (
        <div className="qa-hardening-section">
          <h3>Configuration Hardening</h3>
          <div className="qa-hardening-grid">
            <div className="qa-hardening-item">
              <span className="qa-hardening-label">Niveau</span>
              <span className={`qa-hardening-value qa-hardening-value--${config.level}`}>
                {config.level.toUpperCase()}
              </span>
            </div>
            <div className="qa-hardening-item">
              <span className="qa-hardening-label">CSP</span>
              <span
                className={`qa-hardening-value ${config.csp_enabled ? 'qa-hardening-value--enabled' : ''}`}
              >
                {config.csp_enabled ? '✓ Activé' : '✗ Désactivé'}
              </span>
            </div>
            <div className="qa-hardening-item">
              <span className="qa-hardening-label">Sandbox</span>
              <span
                className={`qa-hardening-value ${config.sandbox_enabled ? 'qa-hardening-value--enabled' : ''}`}
              >
                {config.sandbox_enabled ? '✓ Activé' : '✗ Désactivé'}
              </span>
            </div>
            <div className="qa-hardening-item">
              <span className="qa-hardening-label">Audit Logging</span>
              <span
                className={`qa-hardening-value ${config.audit_logging ? 'qa-hardening-value--enabled' : ''}`}
              >
                {config.audit_logging ? '✓ Activé' : '✗ Désactivé'}
              </span>
            </div>
            <div className="qa-hardening-item">
              <span className="qa-hardening-label">Encryption at Rest</span>
              <span
                className={`qa-hardening-value ${config.encryption_at_rest ? 'qa-hardening-value--enabled' : ''}`}
              >
                {config.encryption_at_rest ? '✓ Activé' : '✗ Désactivé'}
              </span>
            </div>
            <div className="qa-hardening-item">
              <span className="qa-hardening-label">Rate Limiting</span>
              <span
                className={`qa-hardening-value ${config.rate_limiting ? 'qa-hardening-value--enabled' : ''}`}
              >
                {config.rate_limiting ? '✓ Activé' : '✗ Désactivé'}
              </span>
            </div>
          </div>
        </div>
      )}

      {auditResult && (
        <div className="qa-audit-section">
          <h3>Résultat de l'Audit</h3>
          <div className="qa-audit-score">
            <div
              className={`qa-audit-score-circle qa-audit-score-circle--${auditResult.score >= 90 ? 'success' : auditResult.score >= 70 ? 'warning' : 'error'}`}
            >
              <span className="qa-audit-score-value">{auditResult.score.toFixed(0)}</span>
              <span className="qa-audit-score-label">/ 100</span>
            </div>
          </div>
          <div className="qa-audit-summary">
            <div className="qa-audit-stat qa-audit-stat--error">
              <span className="qa-audit-stat-value">{auditResult.critical_issues}</span>
              <span className="qa-audit-stat-label">Critiques</span>
            </div>
            <div className="qa-audit-stat qa-audit-stat--warning">
              <span className="qa-audit-stat-value">{auditResult.warnings}</span>
              <span className="qa-audit-stat-label">Avertissements</span>
            </div>
            <div className="qa-audit-stat qa-audit-stat--success">
              <span className="qa-audit-stat-value">
                {auditResult.passed_checks.length}
              </span>
              <span className="qa-audit-stat-label">Vérifications OK</span>
            </div>
          </div>

          <div className="qa-audit-checks">
            <div className="qa-audit-checks-passed">
              <h4>✅ Vérifications Réussies</h4>
              <ul>
                {auditResult.passed_checks.map((check, i) => (
                  <li key={i}>{check}</li>
                ))}
              </ul>
            </div>
            {auditResult.failed_checks.length > 0 && (
              <div className="qa-audit-checks-failed">
                <h4>❌ Vérifications Échouées</h4>
                <ul>
                  {auditResult.failed_checks.map((check, i) => (
                    <li key={i}>{check}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {auditResult.recommendations.length > 0 && (
            <div className="qa-audit-recommendations">
              <h4>💡 Recommandations</h4>
              <ul>
                {auditResult.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PerformanceTabProps {
  report: PerformanceReport | null;
  logs: LogEntry[];
  onPeriodChange: (period: string) => void;
  currentPeriod: string;
}

const PerformanceTab = ({
  report,
  logs,
  onPeriodChange,
  currentPeriod,
}: PerformanceTabProps): JSX.Element => {
  return (
    <div className="qa-tab-content">
      <div className="qa-section-header">
        <h2>📈 Performance</h2>
        <select
          className="qa-select"
          value={currentPeriod}
          onChange={e => onPeriodChange(e.target.value)}
        >
          <option value="1h">Dernière heure</option>
          <option value="24h">24 heures</option>
          <option value="7d">7 jours</option>
          <option value="30d">30 jours</option>
        </select>
      </div>

      {report && (
        <>
          <div className="qa-perf-grid">
            <div className="qa-perf-card">
              <h4>CPU</h4>
              <div className="qa-perf-values">
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Moyenne</span>
                  <span className="qa-perf-value-num">{report.avg_cpu.toFixed(1)}%</span>
                </div>
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Max</span>
                  <span className="qa-perf-value-num">{report.max_cpu.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="qa-perf-card">
              <h4>Mémoire</h4>
              <div className="qa-perf-values">
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Moyenne</span>
                  <span className="qa-perf-value-num">
                    {report.avg_memory.toFixed(1)}%
                  </span>
                </div>
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Max</span>
                  <span className="qa-perf-value-num">
                    {report.max_memory.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="qa-perf-card">
              <h4>Temps de Réponse</h4>
              <div className="qa-perf-values">
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Moyenne</span>
                  <span className="qa-perf-value-num">
                    {report.avg_response_ms.toFixed(0)}ms
                  </span>
                </div>
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">P95</span>
                  <span className="qa-perf-value-num">
                    {report.p95_response_ms.toFixed(0)}ms
                  </span>
                </div>
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">P99</span>
                  <span className="qa-perf-value-num">
                    {report.p99_response_ms.toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>
            <div className="qa-perf-card">
              <h4>Requêtes</h4>
              <div className="qa-perf-values">
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Total</span>
                  <span className="qa-perf-value-num">
                    {report.total_requests.toLocaleString()}
                  </span>
                </div>
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Erreurs</span>
                  <span className="qa-perf-value-num qa-perf-value-num--error">
                    {report.error_count}
                  </span>
                </div>
                <div className="qa-perf-value">
                  <span className="qa-perf-value-label">Uptime</span>
                  <span className="qa-perf-value-num qa-perf-value-num--success">
                    {report.uptime_percent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="qa-logs-section">
        <h3>📜 Logs Récents</h3>
        <div className="qa-logs-list">
          {logs.map((log, i) => (
            <div key={i} className={`qa-log-entry qa-log-entry--${log.level}`}>
              <span className="qa-log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`qa-log-level qa-log-level--${log.level}`}>
                {log.level.toUpperCase()}
              </span>
              <span className="qa-log-source">[{log.source}]</span>
              <span className="qa-log-message">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="qa-empty">Aucun log à afficher</div>}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

type TabId = 'overview' | 'tests' | 'monitors' | 'alerts' | 'security' | 'performance';

function QAMonitoringPageContent(): JSX.Element {
  const qa = useQAMonitoring();
  const {
    matrix: _matrix,
    isLoaded: _isLoaded,
    loading: matrixLoading,
  } = useIdentityMatrix();
  const _singularityState = useSingularityStateSafe();

  // State
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [state, setState] = useState<QASystemState | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showResolvedAlerts, setShowResolvedAlerts] = useState(false);
  const [hardeningConfig, setHardeningConfig] = useState<HardeningConfig | null>(null);
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [perfReport, setPerfReport] = useState<PerformanceReport | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [perfPeriod, setPerfPeriod] = useState('24h');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        stateData,
        metricsData,
        suitesData,
        monitorsData,
        alertsData,
        configData,
        reportData,
        logsData,
      ] = await Promise.all([
        qa.getState(),
        qa.getSystemMetrics(),
        qa.listTestSuites(),
        qa.listMonitors(),
        qa.listAlerts(showResolvedAlerts),
        qa.getHardeningConfig(),
        qa.getPerformanceReport(perfPeriod),
        qa.getLogs(undefined, undefined, 50),
      ]);

      setState(stateData);
      setMetrics(metricsData);
      setSuites(suitesData);
      setMonitors(monitorsData);
      setAlerts(alertsData);
      setHardeningConfig(configData);
      setPerfReport(reportData);
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      logger.error(
        'QA data loading failed',
        { component: 'QAMonitoringPage', action: 'loadData' },
        err as Error
      );
    } finally {
      setLoading(false);
    }
  }, [qa, showResolvedAlerts, perfPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleRunSuite = async (suiteId: string) => {
    try {
      setIsRunningTests(true);
      const results = await qa.runTestSuite(suiteId);
      setTestResults(results);
    } catch (err) {
      logger.error(
        'Test suite execution failed',
        { component: 'QAMonitoringPage', action: 'runTestSuite', suiteId },
        err as Error
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleToggleMonitor = async (monitorId: string, active: boolean) => {
    try {
      await qa.toggleMonitor(monitorId, active);
      const updated = await qa.listMonitors();
      setMonitors(updated);
    } catch (err) {
      logger.error(
        'Monitor toggle failed',
        { component: 'QAMonitoringPage', action: 'toggleMonitor', monitorId },
        err as Error
      );
    }
  };

  const handleDeleteMonitor = async (monitorId: string) => {
    try {
      await qa.deleteMonitor(monitorId);
      const updated = await qa.listMonitors();
      setMonitors(updated);
    } catch (err) {
      logger.error(
        'Monitor deletion failed',
        { component: 'QAMonitoringPage', action: 'deleteMonitor', monitorId },
        err as Error
      );
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await qa.acknowledgeAlert(alertId);
      const updated = await qa.listAlerts(showResolvedAlerts);
      setAlerts(updated);
    } catch (err) {
      logger.error(
        'Alert acknowledgement failed',
        { component: 'QAMonitoringPage', action: 'acknowledgeAlert', alertId },
        err as Error
      );
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await qa.resolveAlert(alertId, 'Resolved via QA Dashboard');
      const updated = await qa.listAlerts(showResolvedAlerts);
      setAlerts(updated);
    } catch (err) {
      logger.error(
        'Alert resolution failed',
        { component: 'QAMonitoringPage', action: 'resolveAlert', alertId },
        err as Error
      );
    }
  };

  const handleRunAudit = async () => {
    try {
      setIsAuditing(true);
      const result = await qa.runSecurityAudit();
      setAuditResult(result);
    } catch (err) {
      logger.error(
        'Security audit execution failed',
        { component: 'QAMonitoringPage', action: 'runSecurityAudit' },
        err as Error
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const handlePeriodChange = async (period: string) => {
    setPerfPeriod(period);
    try {
      const report = await qa.getPerformanceReport(period);
      setPerfReport(report);
    } catch (err) {
      logger.error(
        'Performance report generation failed',
        { component: 'QAMonitoringPage', action: 'getPerformanceReport', period },
        err as Error
      );
    }
  };

  // Render
  if (loading || matrixLoading) {
    return (
      <div className="qa-page qa-page--loading">
        <div className="qa-loader">
          <span className="qa-loader-icon">🔄</span>
          <span>Chargement QA Monitoring...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qa-page qa-page--error">
        <div className="qa-error">
          <span className="qa-error-icon">⚠️</span>
          <span>{error}</span>
          <button className="qa-btn qa-btn--primary" onClick={loadData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: "Vue d'ensemble", icon: '🎯' },
    { id: 'tests', label: 'Tests', icon: '🧪' },
    { id: 'monitors', label: 'Moniteurs', icon: '📊' },
    { id: 'alerts', label: 'Alertes', icon: '🔔' },
    { id: 'security', label: 'Sécurité', icon: '🛡️' },
    { id: 'performance', label: 'Performance', icon: '📈' },
  ];

  return (
    <div className="qa-page">
      <header className="qa-header">
        <h1>🔬 QA Monitoring Center</h1>
        <span className="qa-version">OPUS #7 • v∞.7.0</span>
      </header>

      <nav className="qa-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`qa-tab ${activeTab === tab.id ? 'qa-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="qa-tab-icon">{tab.icon}</span>
            <span className="qa-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="qa-main">
        {activeTab === 'overview' && (
          <OverviewTab
            state={state}
            metrics={metrics}
            alerts={alerts}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'tests' && (
          <TestsTab
            suites={suites}
            results={testResults}
            onRunSuite={handleRunSuite}
            isRunning={isRunningTests}
          />
        )}
        {activeTab === 'monitors' && (
          <MonitorsTab
            monitors={monitors}
            onToggle={handleToggleMonitor}
            onDelete={handleDeleteMonitor}
          />
        )}
        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            showResolved={showResolvedAlerts}
            onToggleResolved={() => setShowResolvedAlerts(!showResolvedAlerts)}
          />
        )}
        {activeTab === 'security' && (
          <SecurityTab
            config={hardeningConfig}
            auditResult={auditResult}
            onRunAudit={handleRunAudit}
            isAuditing={isAuditing}
          />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab
            report={perfReport}
            logs={logs}
            onPeriodChange={handlePeriodChange}
            currentPeriod={perfPeriod}
          />
        )}
      </main>
    </div>
  );
}

// Export with ErrorBoundary
export default function QAMonitoringPage(): JSX.Element {
  return (
    <ErrorBoundary context="QAMonitoring">
      <QAMonitoringPageContent />
    </ErrorBoundary>
  );
}
