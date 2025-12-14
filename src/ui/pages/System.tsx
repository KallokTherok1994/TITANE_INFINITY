/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════
 *   TITANE∞ v15.5 — SYSTEM PAGE
 *   CPU/GPU, modules, Auto-Évolution, diagnostics, logs
 * ═══════════════════════════════════════════════════════════
 */

import React, { useState, useCallback } from 'react';
import { HUDFrame } from '../components/HUDFrame';
import './styles/System.css';

interface SystemModule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  version: string;
  uptime: string;
}

const SYSTEM_MODULES: SystemModule[] = [
  {
    id: 'auto-evolution',
    name: 'Auto-Évolution',
    status: 'active',
    version: '15.5.0',
    uptime: '127h',
  },
  {
    id: 'memory-engine',
    name: 'MemoryEngine',
    status: 'active',
    version: '15.5.0',
    uptime: '127h',
  },
  {
    id: 'exp-engine',
    name: 'ExpEngine',
    status: 'active',
    version: '15.5.0',
    uptime: '127h',
  },
  {
    id: 'self-heal',
    name: 'Self-Heal',
    status: 'active',
    version: '15.5.0',
    uptime: '127h',
  },
  {
    id: 'watchdog',
    name: 'Watchdog',
    status: 'active',
    version: '15.5.0',
    uptime: '127h',
  },
];

export const SystemPage: React.FC = React.memo(() => {
  const [cpuUsage] = useState(42); // Mock data
  const [memoryUsage] = useState(65); // Mock data
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Système démarré avec succès',
    '[INFO] Tous les modules sont opérationnels',
    '[INFO] Auto-Évolution: cycle de veille actif',
  ]);

  const handleRestartModule = useCallback((moduleId: string) => {
    setLogs(prev => [...prev, `[INFO] Redémarrage du module ${moduleId}...`]);
  }, []);

  return (
    <div className="system-page">
      <div className="system-grid">
        {/* Performance */}
        <HUDFrame title="Performances" icon="⚡" className="system-performance">
          <div className="system-metrics">
            <div className="system-metric">
              <div className="system-metric-header">
                <span className="system-metric-label">CPU</span>
                <span className="system-metric-value">{cpuUsage}%</span>
              </div>
              <div className="system-metric-bar">
                <CpuBar percentage={cpuUsage} />
              </div>
            </div>

            <div className="system-metric">
              <div className="system-metric-header">
                <span className="system-metric-label">Mémoire</span>
                <span className="system-metric-value">{memoryUsage}%</span>
              </div>
              <div className="system-metric-bar">
                <MemoryBar percentage={memoryUsage} />
              </div>
            </div>
          </div>
        </HUDFrame>

        {/* Modules */}
        <HUDFrame title="Modules TITANE∞" icon="🧩" className="system-modules">
          <div className="system-modules-list">
            {SYSTEM_MODULES.map(module => (
              <div key={module.id} className="system-module-item">
                <div className="system-module-info">
                  <div className={`system-module-status status-${module.status}`} />
                  <div className="system-module-details">
                    <span className="system-module-name">{module.name}</span>
                    <span className="system-module-meta">
                      v{module.version} • Uptime: {module.uptime}
                    </span>
                  </div>
                </div>
                <button
                  className="system-module-restart"
                  onClick={() => handleRestartModule(module.id)}
                >
                  🔄
                </button>
              </div>
            ))}
          </div>
        </HUDFrame>

        {/* Logs */}
        <HUDFrame title="Logs Système" icon="📋" className="system-logs">
          <div className="system-logs-container">
            {logs.map((log, idx) => (
              <div key={idx} className="system-log-entry">
                <span className="system-log-time">
                  {new Date().toLocaleTimeString('fr-FR')}
                </span>
                <span className="system-log-text">{log}</span>
              </div>
            ))}
          </div>
        </HUDFrame>
      </div>
    </div>
  );
});

SystemPage.displayName = 'SystemPage';

// Composants memoized pour éviter re-renders inutiles
const CpuBar: React.FC<{ percentage: number }> = React.memo(({ percentage }) => (
  <div className="system-metric-fill cpu" style={{ width: `${percentage}%` }} />
));
CpuBar.displayName = 'CpuBar';

const MemoryBar: React.FC<{ percentage: number }> = React.memo(({ percentage }) => (
  <div className="system-metric-fill memory" style={{ width: `${percentage}%` }} />
));
MemoryBar.displayName = 'MemoryBar';
