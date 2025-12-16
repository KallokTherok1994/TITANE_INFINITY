/**
 * TITANE∞ v24.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.3.0 — ONE CORE PAGE — Unified Command Center
 *   v22Ω AI Performance Optimizations Compatible
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOneCore } from './useOneCore';
import { ONE_CORE_TABS, CONSCIOUSNESS_LEVELS, SYSTEM_MODES } from './types';
import type { OneCoreTabs, CenterStatus, OneCoreCommand } from './types';
import './OneCorePage.css';

// ═══════════════════════════════════════════════════════════════════
// Composants internes
// ═══════════════════════════════════════════════════════════════════

function HealthBar({ value, label }: { value: number; label: string }): JSX.Element {
  const percentage = Math.round(value * 100);
  const color = percentage >= 90 ? '#00ff88' : percentage >= 70 ? '#ffaa00' : '#ff4444';

  return (
    <div className="one-core-health-bar">
      <div className="one-core-health-label">{label}</div>
      <div className="one-core-health-track">
        <div
          className="one-core-health-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="one-core-health-value">{percentage}%</div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: number | string;
  unit?: string;
}): JSX.Element {
  return (
    <div className="one-core-metric-card">
      <div className="one-core-metric-icon">{icon}</div>
      <div className="one-core-metric-content">
        <div className="one-core-metric-value">
          {typeof value === 'number' ? value.toFixed(1) : value}
          {unit && <span className="one-core-metric-unit">{unit}</span>}
        </div>
        <div className="one-core-metric-label">{label}</div>
      </div>
    </div>
  );
}

function CenterCard({
  center,
  onClick,
}: {
  center: CenterStatus;
  onClick: () => void;
}): JSX.Element {
  const healthColor =
    center.global_health >= 0.9
      ? '#00ff88'
      : center.global_health >= 0.7
        ? '#ffaa00'
        : '#ff4444';

  return (
    <div className="one-core-center-card" onClick={onClick}>
      <div className="one-core-center-header">
        <h3>{center.name}</h3>
        <span className="one-core-center-category">{center.category}</span>
      </div>
      <div className="one-core-center-stats">
        <div className="one-core-center-engines">
          <span className="one-core-center-active">{center.active_engines}</span>
          <span className="one-core-center-total">/ {center.engines_count} moteurs</span>
        </div>
        <div className="one-core-center-health" style={{ color: healthColor }}>
          {Math.round(center.global_health * 100)}%
        </div>
      </div>
      <div className="one-core-center-route">{center.route}</div>
    </div>
  );
}

function CommandButton({
  command,
  onExecute,
}: {
  command: OneCoreCommand;
  onExecute: (id: string) => void;
}): JSX.Element {
  const [executing, setExecuting] = useState(false);

  const handleClick = async () => {
    if (
      command.dangerous &&
      !confirm(
        `⚠️ ${command.name}\n\n${command.description}\n\nCette action est dangereuse. Continuer ?`
      )
    ) {
      return;
    }
    setExecuting(true);
    await onExecute(command.id);
    setExecuting(false);
  };

  return (
    <button
      className={`one-core-command-btn ${command.dangerous ? 'dangerous' : ''} ${executing ? 'executing' : ''}`}
      onClick={handleClick}
      disabled={executing}
    >
      <span className="one-core-command-name">{command.name}</span>
      <span className="one-core-command-desc">{command.description}</span>
      {command.dangerous && <span className="one-core-command-warning">⚠️</span>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tabs Content
// ═══════════════════════════════════════════════════════════════════

function OverviewTab({
  state,
  metrics,
}: {
  state: ReturnType<typeof useOneCore>['state'];
  metrics: ReturnType<typeof useOneCore>['metrics'];
}): JSX.Element {
  if (!state) return <div className="one-core-loading">Chargement...</div>;

  const consciousness =
    CONSCIOUSNESS_LEVELS[state.consciousness_level] || CONSCIOUSNESS_LEVELS[0];
  const systemMode = SYSTEM_MODES.find(m => m.id === state.mode) || SYSTEM_MODES[0];

  return (
    <div className="one-core-overview">
      {/* Header Status */}
      <div className="one-core-status-header">
        <div className="one-core-identity">
          <h2>TITANE∞ {state.version}</h2>
          <span className="one-core-codename">{state.codename}</span>
        </div>
        <div
          className="one-core-consciousness"
          style={{ borderColor: consciousness.color }}
        >
          <span
            className="one-core-consciousness-level"
            style={{ color: consciousness.color }}
          >
            Niveau {state.consciousness_level}
          </span>
          <span className="one-core-consciousness-name">{consciousness.name}</span>
        </div>
        <div
          className="one-core-mode"
          style={{
            backgroundColor: systemMode.color + '33',
            borderColor: systemMode.color,
          }}
        >
          {systemMode.name}
        </div>
      </div>

      {/* Health Metrics */}
      <div className="one-core-health-section">
        <h3>🏥 Santé Système</h3>
        <div className="one-core-health-grid">
          <HealthBar value={state.global_health} label="Santé globale" />
          <HealthBar value={state.coherence_score} label="Cohérence" />
          <HealthBar value={1 - state.cpu_usage} label="CPU disponible" />
          <HealthBar value={1 - state.memory_usage} label="Mémoire disponible" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="one-core-metrics-section">
        <h3>📊 Métriques</h3>
        <div className="one-core-metrics-grid">
          <MetricCard
            icon="🔧"
            label="Moteurs actifs"
            value={`${state.active_engines}/${state.total_engines}`}
          />
          <MetricCard icon="🏛️" label="Centres" value={state.total_centers} />
          <MetricCard
            icon="⏱️"
            label="Uptime"
            value={Math.round(state.uptime_seconds / 60)}
            unit="min"
          />
          {metrics && (
            <>
              <MetricCard icon="⚡" label="Req/s" value={metrics.requests_per_second} />
              <MetricCard
                icon="📶"
                label="Connexions"
                value={metrics.active_connections}
              />
              <MetricCard
                icon="⏰"
                label="Latence"
                value={metrics.avg_response_time_ms}
                unit="ms"
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="one-core-quick-actions">
        <h3>⚡ Actions rapides</h3>
        <div className="one-core-quick-buttons">
          <button className="one-core-quick-btn sync">🔄 Synchroniser</button>
          <button className="one-core-quick-btn health">🏥 Diagnostic</button>
          <button className="one-core-quick-btn optimize">⚡ Optimiser</button>
          <button className="one-core-quick-btn cleanup">🧹 Nettoyer</button>
        </div>
      </div>
    </div>
  );
}

function CentersTab({
  centers,
  navigate,
}: {
  centers: CenterStatus[];
  navigate: (path: string) => void;
}): JSX.Element {
  return (
    <div className="one-core-centers">
      <h3>🏛️ Centres TITANE∞</h3>
      <p className="one-core-centers-desc">
        Accédez à tous les centres de contrôle du système. Chaque centre gère un aspect
        spécifique de TITANE∞.
      </p>
      <div className="one-core-centers-grid">
        {centers.map(center => (
          <CenterCard
            key={center.route}
            center={center}
            onClick={() => navigate(center.route)}
          />
        ))}
      </div>
    </div>
  );
}

function CommandsTab({
  commands,
  onExecute,
}: {
  commands: OneCoreCommand[];
  onExecute: (id: string) => void;
}): JSX.Element {
  const categories = [...new Set(commands.map(c => c.category))];

  return (
    <div className="one-core-commands">
      <h3>⚡ Commandes système</h3>
      <p className="one-core-commands-desc">
        Exécutez des commandes pour contrôler et maintenir le système TITANE∞.
      </p>
      {categories.map(category => (
        <div key={category} className="one-core-command-category">
          <h4>{category}</h4>
          <div className="one-core-command-list">
            {commands
              .filter(c => c.category === category)
              .map(cmd => (
                <CommandButton key={cmd.id} command={cmd} onExecute={onExecute} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DiagnosticTab({
  diagnostic,
  onRun,
}: {
  diagnostic: ReturnType<typeof useOneCore>['diagnostic'];
  onRun: () => void;
}): JSX.Element {
  const statusColors: Record<string, string> = {
    optimal: '#00ff88',
    good: '#88ff88',
    degraded: '#ffaa00',
    critical: '#ff4444',
  };

  return (
    <div className="one-core-diagnostic">
      <h3>🔍 Diagnostic système</h3>

      <button className="one-core-run-diagnostic" onClick={onRun}>
        ▶️ Lancer un diagnostic complet
      </button>

      {diagnostic && (
        <div className="one-core-diagnostic-results">
          <div className="one-core-diagnostic-header">
            <span
              className="one-core-diagnostic-status"
              style={{ color: statusColors[diagnostic.overall_status] || '#888' }}
            >
              {diagnostic.overall_status.toUpperCase()}
            </span>
            <span className="one-core-diagnostic-time">{diagnostic.duration_ms}ms</span>
          </div>

          <div className="one-core-diagnostic-tests">
            <div className="one-core-test-passed">
              ✅ {diagnostic.tests_passed} tests passés
            </div>
            <div className="one-core-test-failed">
              ❌ {diagnostic.tests_failed} tests échoués
            </div>
            <div className="one-core-test-total">
              📝 {diagnostic.tests_total} tests total
            </div>
          </div>

          {diagnostic.warnings.length > 0 && (
            <div className="one-core-diagnostic-warnings">
              <h4>⚠️ Avertissements</h4>
              <ul>
                {diagnostic.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {diagnostic.errors.length > 0 && (
            <div className="one-core-diagnostic-errors">
              <h4>❌ Erreurs</h4>
              <ul>
                {diagnostic.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {diagnostic.recommendations.length > 0 && (
            <div className="one-core-diagnostic-recommendations">
              <h4>💡 Recommandations</h4>
              <ul>
                {diagnostic.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricsTab({
  metrics,
}: {
  metrics: ReturnType<typeof useOneCore>['metrics'];
}): JSX.Element {
  if (!metrics)
    return <div className="one-core-loading">Chargement des métriques...</div>;

  return (
    <div className="one-core-metrics-tab">
      <h3>📊 Métriques temps réel</h3>

      <div className="one-core-metrics-detailed">
        <div className="one-core-metric-group">
          <h4>Performance</h4>
          <div className="one-core-metric-row">
            <span>Requêtes/seconde</span>
            <span>{metrics.requests_per_second.toFixed(1)}</span>
          </div>
          <div className="one-core-metric-row">
            <span>Temps de réponse moyen</span>
            <span>{metrics.avg_response_time_ms.toFixed(1)} ms</span>
          </div>
          <div className="one-core-metric-row">
            <span>Connexions actives</span>
            <span>{metrics.active_connections}</span>
          </div>
          <div className="one-core-metric-row">
            <span>Profondeur file d'attente</span>
            <span>{metrics.queue_depth}</span>
          </div>
        </div>

        <div className="one-core-metric-group">
          <h4>Pression système</h4>
          <HealthBar value={1 - metrics.cpu_pressure} label="CPU" />
          <HealthBar value={1 - metrics.memory_pressure} label="Mémoire" />
          <HealthBar value={1 - metrics.io_pressure} label="I/O" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Page principale
// ═══════════════════════════════════════════════════════════════════

export function OneCorePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<OneCoreTabs>('overview');
  const navigate = useNavigate();
  const {
    state,
    metrics,
    diagnostic,
    commands,
    loading,
    error,
    executeCommand,
    runDiagnostic,
  } = useOneCore();

  if (loading && !state) {
    return (
      <div className="one-core-page loading">
        <div className="one-core-loader">
          <span className="one-core-loader-icon">🌌</span>
          <span>Initialisation ONE CORE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="one-core-page">
      {/* Header */}
      <header className="one-core-header">
        <div className="one-core-title">
          <span className="one-core-icon">🌌</span>
          <h1>ONE CORE</h1>
          <span className="one-core-subtitle">Centre de commande unifié TITANE∞</span>
        </div>
        {error && <div className="one-core-error">⚠️ {error}</div>}
      </header>

      {/* Tabs Navigation */}
      <nav className="one-core-tabs">
        {ONE_CORE_TABS.map(tab => (
          <button
            key={tab.id}
            className={`one-core-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="one-core-tab-icon">{tab.icon}</span>
            <span className="one-core-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="one-core-content">
        {activeTab === 'overview' && <OverviewTab state={state} metrics={metrics} />}
        {activeTab === 'centers' && (
          <CentersTab centers={state?.centers || []} navigate={navigate} />
        )}
        {activeTab === 'commands' && (
          <CommandsTab commands={commands} onExecute={executeCommand} />
        )}
        {activeTab === 'diagnostic' && (
          <DiagnosticTab diagnostic={diagnostic} onRun={runDiagnostic} />
        )}
        {activeTab === 'metrics' && <MetricsTab metrics={metrics} />}
      </main>
    </div>
  );
}

export default OneCorePage;
