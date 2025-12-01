/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.MPE-2/3 — MEMORY HEALTH PANEL
 * Dashboard santé mémoire + Self-Healing + Backup
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface HealthIssue {
  id: string;
  severity: string;
  category: string;
  message: string;
  auto_fixable: boolean;
}

interface Recommendation {
  id: string;
  priority: number;
  message: string;
  action: string;
  command: string | null;
}

interface MemoryHealth {
  schema_version: number;
  current_version: number;
  db_integrity_ok: boolean;
  last_integrity_check: number | null;
  last_snapshot_at: number | null;
  last_compaction_at: number | null;
  event_log_size_bytes: number;
  event_count: number;
  snapshot_count: number;
  estimated_recovery_time_ms: number | null;
  last_backup_at: number | null;
  issues: HealthIssue[];
  health_score: number;
  recommendations: Recommendation[];
}

interface SelfHealingReport {
  timestamp: number;
  issues_fixed: number;
  issues_remaining: number;
  duration_ms: number;
  success: boolean;
  actions: Array<{
    action_type: string;
    description: string;
    success: boolean;
    details: string | null;
  }>;
}

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  fields_checked: number;
  duration_ms: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

const formatTimestamp = (ts: number | null): string => {
  if (!ts) return 'Jamais';
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  
  if (diff < 60000) return 'Il y a quelques secondes';
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'text-red-500 bg-red-500/10';
    case 'warning': return 'text-yellow-500 bg-yellow-500/10';
    default: return 'text-blue-500 bg-blue-500/10';
  }
};

const getHealthScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-red-500';
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const MemoryHealthPanel: FC = () => {
  const [health, setHealth] = useState<MemoryHealth | null>(null);
  const [healingReport, setHealingReport] = useState<SelfHealingReport | null>(null);
  const [_validationResult, _setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'backup' | 'advanced'>('health');

  const env = detectEnvironment();

  // Charger l'état de santé
  const loadHealth = useCallback(async () => {
    if (!env.isTauri) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await secureInvoke<MemoryHealth>('titan_get_memory_health');
      setHealth(result);
    } catch (err) {
      setError(`Erreur: ${err}`);
      console.error('[MemoryHealthPanel] Erreur chargement santé:', err);
    } finally {
      setIsLoading(false);
    }
  }, [env.isTauri]);

  // Lancer Self-Healing
  const runSelfHealing = useCallback(async () => {
    if (!env.isTauri) return;
    
    setIsHealing(true);
    setError(null);
    
    try {
      const report = await secureInvoke<SelfHealingReport>('titan_run_self_healing');
      setHealingReport(report);
      // Recharger l'état de santé
      await loadHealth();
    } catch (err) {
      setError(`Erreur Self-Healing: ${err}`);
    } finally {
      setIsHealing(false);
    }
  }, [env.isTauri, loadHealth]);

  // Forcer un snapshot
  const forceSnapshot = useCallback(async () => {
    if (!env.isTauri) return;
    
    try {
      // TODO: obtenir l'état actuel depuis le store
      const stateJson = JSON.stringify({});
      await secureInvoke('titan_force_snapshot', { stateJson });
      await loadHealth();
    } catch (err) {
      setError(`Erreur snapshot: ${err}`);
    }
  }, [env.isTauri, loadHealth]);

  // Compacter le journal
  const compactJournal = useCallback(async () => {
    if (!env.isTauri) return;
    
    try {
      await secureInvoke('titan_compact_journal');
      await loadHealth();
    } catch (err) {
      setError(`Erreur compaction: ${err}`);
    }
  }, [env.isTauri, loadHealth]);

  // Vérifier l'intégrité
  const checkIntegrity = useCallback(async () => {
    if (!env.isTauri) return;
    
    try {
      await secureInvoke('titan_run_full_integrity_check');
      await loadHealth();
    } catch (err) {
      setError(`Erreur vérification: ${err}`);
    }
  }, [env.isTauri, loadHealth]);

  // Exporter les données
  const exportData = useCallback(async () => {
    if (!env.isTauri) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = `~/Documents/TITANE_INFINITY_Backups/backup_${timestamp}.titane`;
      await secureInvoke('titan_export_data', { 
        path,
        description: `Backup manuel ${new Date().toLocaleDateString('fr-FR')}`
      });
      await loadHealth();
      alert('Export réussi !');
    } catch (err) {
      setError(`Erreur export: ${err}`);
    }
  }, [env.isTauri, loadHealth]);

  // Charger au montage
  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  // Si pas en Tauri, afficher un message
  if (!env.isTauri) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          🧠 Memory Health Dashboard
        </h3>
        <p className="text-gray-500">
          Disponible uniquement dans l'application Tauri.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🧠 Memory Health
          {health && (
            <span className={`text-2xl font-bold ${getHealthScoreColor(health.health_score)}`}>
              {health.health_score}%
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={loadHealth}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50"
          >
            🔄 Rafraîchir
          </button>
          <button
            onClick={runSelfHealing}
            disabled={isHealing || !health?.issues.some(i => i.auto_fixable)}
            className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-500 rounded text-white disabled:opacity-50"
          >
            {isHealing ? '⏳ En cours...' : '🩹 Self-Healing'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {(['health', 'backup', 'advanced'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t ${
              activeTab === tab 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'health' && '📊 Santé'}
            {tab === 'backup' && '💾 Backup'}
            {tab === 'advanced' && '🔧 Avancé'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && !health && (
        <div className="text-center py-8 text-gray-400">
          ⏳ Chargement...
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && health && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard 
              label="Schéma" 
              value={`v${health.schema_version}`}
              subvalue={health.schema_version < health.current_version ? `→ v${health.current_version}` : '✓'}
            />
            <StatCard 
              label="Événements" 
              value={health.event_count.toLocaleString()}
              subvalue={formatBytes(health.event_log_size_bytes)}
            />
            <StatCard 
              label="Snapshots" 
              value={health.snapshot_count.toString()}
              subvalue={formatTimestamp(health.last_snapshot_at)}
            />
            <StatCard 
              label="Intégrité" 
              value={health.db_integrity_ok ? '✅ OK' : '❌ Erreur'}
              subvalue={formatTimestamp(health.last_integrity_check)}
            />
          </div>

          {/* Issues */}
          {health.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">
                ⚠️ Problèmes détectés ({health.issues.length})
              </h4>
              <div className="space-y-1">
                {health.issues.map(issue => (
                  <div 
                    key={issue.id}
                    className={`p-2 rounded text-sm flex items-center justify-between ${getSeverityColor(issue.severity)}`}
                  >
                    <span>{issue.message}</span>
                    {issue.auto_fixable && (
                      <span className="text-xs opacity-70">Auto-réparable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {health.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">
                💡 Recommandations
              </h4>
              <div className="space-y-1">
                {health.recommendations.map(rec => (
                  <div 
                    key={rec.id}
                    className="p-2 bg-blue-900/20 border border-blue-800/30 rounded text-sm text-blue-300"
                  >
                    <span className="opacity-70">[P{rec.priority}]</span> {rec.message}
                    <div className="text-xs opacity-60 mt-1">{rec.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Healing Report */}
          {healingReport && (
            <div className="p-3 bg-gray-800 rounded space-y-2">
              <h4 className="text-sm font-medium text-gray-300">
                🩹 Dernier Self-Healing
              </h4>
              <div className="text-sm text-gray-400">
                <div>✅ {healingReport.issues_fixed} corrigés</div>
                <div>⏳ {healingReport.issues_remaining} restants</div>
                <div>⏱️ {formatDuration(healingReport.duration_ms)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportData}
              className="p-4 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 rounded-lg text-left"
            >
              <div className="text-lg mb-1">📤 Exporter</div>
              <div className="text-sm text-gray-400">
                Créer une archive complète
              </div>
            </button>
            <button
              disabled
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-left opacity-50"
            >
              <div className="text-lg mb-1">📥 Importer</div>
              <div className="text-sm text-gray-500">
                Restaurer depuis archive
              </div>
            </button>
          </div>

          {health?.last_backup_at && (
            <div className="p-3 bg-gray-800 rounded text-sm">
              <span className="text-gray-400">Dernier backup:</span>{' '}
              <span className="text-white">{formatTimestamp(health.last_backup_at)}</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Les backups sont stockés dans ~/Documents/TITANE_INFINITY_Backups/
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              label="📸 Snapshot"
              description="Créer un snapshot maintenant"
              onClick={forceSnapshot}
            />
            <ActionButton
              label="🗜️ Compacter"
              description="Compacter le journal"
              onClick={compactJournal}
            />
            <ActionButton
              label="🔍 Intégrité"
              description="Check complet"
              onClick={checkIntegrity}
            />
            <ActionButton
              label="📋 Dump État"
              description="Exporter JSON brut"
              onClick={async () => {
                try {
                  const dump = await secureInvoke<string>('titan_dump_raw_state');
                  console.log('[MemoryHealth] Raw state:', JSON.parse(dump));
                  alert('État affiché dans la console');
                } catch (err) {
                  setError(`Erreur dump: ${err}`);
                }
              }}
            />
          </div>

          {health?.estimated_recovery_time_ms && (
            <div className="p-3 bg-gray-800 rounded text-sm">
              <span className="text-gray-400">Temps de recovery estimé:</span>{' '}
              <span className="text-white">{formatDuration(health.estimated_recovery_time_ms)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const StatCard: FC<{
  label: string;
  value: string;
  subvalue?: string;
}> = ({ label, value, subvalue }: { label: string; value: string; subvalue?: string }) => (
  <div className="p-3 bg-gray-800 rounded">
    <div className="text-xs text-gray-500 uppercase">{label}</div>
    <div className="text-lg font-semibold text-white">{value}</div>
    {subvalue && <div className="text-xs text-gray-400">{subvalue}</div>}
  </div>
);

const ActionButton: FC<{
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, description, onClick, disabled }: { label: string; description: string; onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-left disabled:opacity-50"
  >
    <div className="text-sm font-medium text-white">{label}</div>
    <div className="text-xs text-gray-500">{description}</div>
  </button>
);

export default MemoryHealthPanel;
