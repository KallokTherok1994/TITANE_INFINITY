/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Admin Dashboard Component
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        AdminDashboard.tsx
 * @version     vΩ∞Ω+
 *
 * Dashboard principal de l'Admin Engine
 * Affiche l'état global, vitals, modules et permet les actions admin
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cpu,
  HardDrive,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Shield,
  Zap,
  Database,
  Bot,
  Eye,
  TrendingUp,
  Server,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type {
  AdminSnapshot,
  AdminRole,
  HealthLevel,
  TitaneModule,
  AdminView,
} from '../../services/adminEngine';
import {
  getAdminEngine,
  HEALTH_LEVEL_COLORS,
  MODULE_STATUS_COLORS,
  MODULE_DISPLAY_NAMES,
  formatBytes,
  formatDuration,
  createEmptySnapshot,
} from '../../services/adminEngine';
import { logger } from '@/utils/logger';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface AdminDashboardProps {
  className?: string;
  userRole: AdminRole;
  refreshInterval?: number;
  onActionExecuted?: (actionId: string, success: boolean) => void;
}

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Badge de niveau de santé
 */
const HealthBadge: React.FC<{ level: HealthLevel }> = ({ level }) => {
  const color = HEALTH_LEVEL_COLORS[level];
  const Icon =
    level === 'OK' ? CheckCircle : level === 'CRITICAL' ? XCircle : AlertTriangle;

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg"
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}` }}
    >
      <Icon size={20} style={{ color }} />
      <span className="font-semibold" style={{ color }}>
        {level}
      </span>
    </motion.div>
  );
};

/**
 * Carte de métrique vitale
 */
const VitalCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  warning?: boolean;
  critical?: boolean;
}> = ({ label, value, unit, icon, warning, critical }) => {
  const borderColor = critical ? '#ef4444' : warning ? '#f59e0b' : '#727B81';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-lg bg-bg-secondary border"
      style={{ borderColor }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-secondary text-sm">{label}</span>
        <div className="text-text-muted">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-bold"
          style={{ color: critical ? '#ef4444' : warning ? '#f59e0b' : '#C4C4C4' }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-text-muted text-sm">{unit}</span>}
      </div>
    </motion.div>
  );
};

/**
 * Carte de module
 */
const ModuleCard: React.FC<{
  moduleId: TitaneModule;
  status: string;
  latency: number;
  errors: number;
  onClick?: () => void;
}> = ({ moduleId, status, latency, errors, onClick }) => {
  const statusColor =
    MODULE_STATUS_COLORS[status as keyof typeof MODULE_STATUS_COLORS] || '#9ca3af';
  const displayName = MODULE_DISPLAY_NAMES[moduleId] || moduleId;

  const getModuleIcon = () => {
    switch (moduleId) {
      case 'performance':
        return <Gauge size={18} />;
      case 'memory':
        return <Database size={18} />;
      case 'ollama':
      case 'gemini':
        return <Bot size={18} />;
      case 'tauri':
        return <Server size={18} />;
      case 'selfHealing':
        return <Shield size={18} />;
      default:
        return <Zap size={18} />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-3 rounded-lg bg-bg-secondary border border-border-default cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div style={{ color: statusColor }}>{getModuleIcon()}</div>
          <span className="text-text-secondary text-sm font-medium">{displayName}</span>
        </div>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
      </div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{latency > 0 ? `${latency.toFixed(0)}ms` : '-'}</span>
        <span>{errors > 0 ? `${errors} err` : 'OK'}</span>
      </div>
    </motion.div>
  );
};

/**
 * Barre de navigation
 */
const NavBar: React.FC<{
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  userRole: AdminRole;
}> = ({ activeView, onViewChange, userRole }) => {
  const views: { id: AdminView; label: string; icon: React.ReactNode }[] = [
    { id: 'OVERVIEW', label: 'Vue globale', icon: <Activity size={16} /> },
    { id: 'LOGS', label: 'Logs', icon: <Database size={16} /> },
    { id: 'TIMELINE', label: 'Timeline', icon: <Clock size={16} /> },
    { id: 'MODULES', label: 'Modules', icon: <Server size={16} /> },
    { id: 'ACTIONS', label: 'Actions', icon: <Zap size={16} /> },
    { id: 'SETTINGS', label: 'Config', icon: <Settings size={16} /> },
  ];

  // Filtrer les vues selon le rôle
  const filteredViews = views.filter(v => {
    if (userRole === 'USER') return v.id === 'OVERVIEW';
    if (userRole === 'DEV') return v.id !== 'SETTINGS';
    return true;
  });

  return (
    <div className="flex gap-2 p-2 bg-bg-primary rounded-lg border border-border-default">
      {filteredViews.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            activeView === view.id
              ? 'bg-bg-tertiary text-text-primary'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
          }`}
        >
          {view.icon}
          <span className="text-sm">{view.label}</span>
        </button>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  className = '',
  userRole,
  refreshInterval = 5000,
  onActionExecuted: _onActionExecuted,
}) => {
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(createEmptySnapshot());
  const [activeView, setActiveView] = useState<AdminView>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const adminEngine = useMemo(() => getAdminEngine(), []);

  // Initialisation
  useEffect(() => {
    adminEngine.initialize();

    return () => {
      adminEngine.stopMonitoring();
    };
  }, [adminEngine]);

  // Collecte des snapshots
  const fetchSnapshot = useCallback(async () => {
    try {
      const newSnapshot = await adminEngine.getSnapshot();
      setSnapshot(newSnapshot);
      setLastUpdate(Date.now());
      setIsLoading(false);
    } catch (error) {
      logger.error('Erreur collecte snapshot:', error);
    }
  }, [adminEngine]);

  // Polling
  useEffect(() => {
    if (isPaused) return;

    fetchSnapshot();
    const intervalId = setInterval(fetchSnapshot, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchSnapshot, refreshInterval, isPaused]);

  // Listener pour les mises à jour
  useEffect(() => {
    const unsubscribe = adminEngine.onSnapshotUpdate(newSnapshot => {
      setSnapshot(newSnapshot);
      setLastUpdate(Date.now());
    });

    return unsubscribe;
  }, [adminEngine]);

  // Vitals avec thresholds
  const vitalsWithStatus = useMemo(() => {
    const { vitals } = snapshot;
    return {
      cpu: {
        value: vitals.cpuProcess,
        warning: vitals.cpuProcess >= 70,
        critical: vitals.cpuProcess >= 90,
      },
      ram: {
        value: vitals.ramProcessPercent,
        warning: vitals.ramProcessPercent >= 75,
        critical: vitals.ramProcessPercent >= 90,
      },
      fps: {
        value: vitals.fps,
        warning: vitals.fps <= 30,
        critical: vitals.fps <= 15,
      },
      iaLatency: {
        value: Math.max(vitals.ollamaLatency, vitals.geminiLatency),
        warning: Math.max(vitals.ollamaLatency, vitals.geminiLatency) >= 3000,
        critical: Math.max(vitals.ollamaLatency, vitals.geminiLatency) >= 10000,
      },
    };
  }, [snapshot]);

  // Modules actifs
  const activeModules = useMemo(() => {
    return Object.entries(snapshot.modules).map(([id, status]) => ({
      id: id as TitaneModule,
      ...status,
    }));
  }, [snapshot.modules]);

  // Rendu conditionnel si USER n'a pas accès
  if (userRole === 'USER') {
    return (
      <div
        className={`p-6 bg-bg-primary rounded-xl border border-border-default ${className}`}
      >
        <div className="flex items-center justify-center gap-3 text-text-muted">
          <Shield size={24} />
          <span>Accès Admin requis</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 bg-bg-primary rounded-xl border border-border-default ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text-secondary">Admin Dashboard</h2>
          <HealthBadge level={snapshot.healthLevel} />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-text-muted">
            Score:{' '}
            <span className="font-bold text-text-secondary">{snapshot.healthScore}</span>{' '}
            | Grade:{' '}
            <span className="font-bold text-text-secondary">
              {snapshot.performanceGrade}
            </span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg border ${
              isPaused
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-border-default text-text-muted hover:text-text-secondary'
            }`}
          >
            {isPaused ? (
              <Eye size={18} />
            ) : (
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            )}
          </button>

          <span className="text-xs text-text-muted">
            Màj: {new Date(lastUpdate).toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <NavBar activeView={activeView} onViewChange={setActiveView} userRole={userRole} />

      {/* Contenu principal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-6"
        >
          {activeView === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Status message */}
              <div className="p-4 bg-bg-secondary rounded-lg border border-border-default">
                <p className="text-text-secondary">{snapshot.statusMessage}</p>
                <p className="text-xs text-text-muted mt-1">
                  Mode: {snapshot.systemMode} | Uptime:{' '}
                  {formatDuration(snapshot.vitals.uptime)}
                </p>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <VitalCard
                  label="CPU Process"
                  value={vitalsWithStatus.cpu.value}
                  unit="%"
                  icon={<Cpu size={18} />}
                  warning={vitalsWithStatus.cpu.warning}
                  critical={vitalsWithStatus.cpu.critical}
                />
                <VitalCard
                  label="RAM Process"
                  value={vitalsWithStatus.ram.value}
                  unit="%"
                  icon={<HardDrive size={18} />}
                  warning={vitalsWithStatus.ram.warning}
                  critical={vitalsWithStatus.ram.critical}
                />
                <VitalCard
                  label="FPS"
                  value={vitalsWithStatus.fps.value}
                  icon={<Activity size={18} />}
                  warning={vitalsWithStatus.fps.warning}
                  critical={vitalsWithStatus.fps.critical}
                />
                <VitalCard
                  label="IA Latency"
                  value={vitalsWithStatus.iaLatency.value}
                  unit="ms"
                  icon={<Bot size={18} />}
                  warning={vitalsWithStatus.iaLatency.warning}
                  critical={vitalsWithStatus.iaLatency.critical}
                />
              </div>

              {/* Détails mémoire & IO */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <VitalCard
                  label="RAM Utilisée"
                  value={formatBytes(snapshot.vitals.ramProcess)}
                  icon={<Database size={18} />}
                />
                <VitalCard
                  label="RAM Système"
                  value={formatBytes(snapshot.vitals.ramSystemUsed)}
                  icon={<Server size={18} />}
                />
                <VitalCard
                  label="IO Lecture"
                  value={formatBytes(snapshot.vitals.ioReadRate)}
                  unit="/s"
                  icon={<TrendingUp size={18} />}
                />
                <VitalCard
                  label="Threads"
                  value={snapshot.vitals.threadsActive}
                  icon={<Zap size={18} />}
                />
              </div>

              {/* Modules Grid */}
              <div>
                <h3 className="text-lg font-semibold text-text-secondary mb-4">
                  Modules
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {activeModules.map(module => (
                    <ModuleCard
                      key={module.id}
                      moduleId={module.id}
                      status={module.status}
                      latency={module.avgLatency}
                      errors={module.errorCount}
                    />
                  ))}
                </div>
              </div>

              {/* Anomalies actives */}
              {snapshot.activeAnomalies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-secondary mb-4">
                    Anomalies actives ({snapshot.activeAnomalies.length})
                  </h3>
                  <div className="space-y-2">
                    {snapshot.activeAnomalies.slice(0, 5).map(anomaly => (
                      <div
                        key={anomaly.id}
                        className="p-3 bg-bg-secondary rounded-lg border border-error-500 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={18} className="text-error-500" />
                          <div>
                            <p className="text-text-secondary text-sm">
                              {anomaly.message}
                            </p>
                            <p className="text-text-muted text-xs">
                              {MODULE_DISPLAY_NAMES[anomaly.moduleId]} | {anomaly.type}
                            </p>
                          </div>
                        </div>
                        {anomaly.autoHealed && (
                          <span className="text-xs text-success-500 bg-success-500/20 px-2 py-1 rounded">
                            Auto-réparé
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Providers IA */}
              <div>
                <h3 className="text-lg font-semibold text-text-secondary mb-4">
                  Providers IA
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-bg-secondary rounded-lg border border-border-default">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot size={20} className="text-[#8b5cf6]" />
                        <span className="text-text-secondary">Ollama</span>
                      </div>
                      {snapshot.vitals.ollamaLatency >= 0 ? (
                        <Wifi size={18} className="text-success-500" />
                      ) : (
                        <WifiOff size={18} className="text-error-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-text-secondary mt-2">
                      {snapshot.vitals.ollamaLatency >= 0
                        ? `${snapshot.vitals.ollamaLatency.toFixed(0)}ms`
                        : 'Offline'}
                    </p>
                  </div>
                  <div className="p-4 bg-bg-secondary rounded-lg border border-border-default">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot size={20} className="text-[#3b82f6]" />
                        <span className="text-text-secondary">Gemini</span>
                      </div>
                      {snapshot.vitals.geminiLatency >= 0 ? (
                        <Wifi size={18} className="text-success-500" />
                      ) : (
                        <WifiOff size={18} className="text-error-500" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-text-secondary mt-2">
                      {snapshot.vitals.geminiLatency >= 0
                        ? `${snapshot.vitals.geminiLatency.toFixed(0)}ms`
                        : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'MODULES' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-secondary">
                Détails des Modules
              </h3>
              <div className="grid gap-4">
                {activeModules.map(module => (
                  <div
                    key={module.id}
                    className="p-4 bg-bg-secondary rounded-lg border border-border-default"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              MODULE_STATUS_COLORS[
                                module.status as keyof typeof MODULE_STATUS_COLORS
                              ],
                          }}
                        />
                        <span className="text-text-secondary font-medium">
                          {module.displayName}
                        </span>
                      </div>
                      <span
                        className="text-sm px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${MODULE_STATUS_COLORS[module.status as keyof typeof MODULE_STATUS_COLORS]}20`,
                          color:
                            MODULE_STATUS_COLORS[
                              module.status as keyof typeof MODULE_STATUS_COLORS
                            ],
                        }}
                      >
                        {module.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Latence</span>
                        <p className="text-text-secondary">
                          {module.avgLatency.toFixed(0)}ms
                        </p>
                      </div>
                      <div>
                        <span className="text-text-muted">Erreurs</span>
                        <p className="text-text-secondary">{module.errorCount}</p>
                      </div>
                      <div>
                        <span className="text-text-muted">Heal Attempts</span>
                        <p className="text-text-secondary">{module.healAttempts}</p>
                      </div>
                      <div>
                        <span className="text-text-muted">Ops en attente</span>
                        <p className="text-text-secondary">{module.pendingOps}</p>
                      </div>
                    </div>
                    {module.lastError && (
                      <div className="mt-3 p-2 bg-error-500/20 rounded text-sm text-error-500">
                        {module.lastError}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'LOGS' && (
            <div className="text-center text-text-muted py-12">
              <Database size={48} className="mx-auto mb-4 opacity-50" />
              <p>Composant Logs - À implémenter</p>
              <p className="text-sm">Voir AdminTimeline pour la timeline</p>
            </div>
          )}

          {activeView === 'TIMELINE' && (
            <div className="text-center text-text-muted py-12">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>Composant Timeline - À implémenter</p>
            </div>
          )}

          {activeView === 'ACTIONS' && (
            <div className="text-center text-text-muted py-12">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p>Composant Actions - À implémenter</p>
              <p className="text-sm">Voir AdminActions pour les actions admin</p>
            </div>
          )}

          {activeView === 'SETTINGS' && userRole === 'ADMIN' && (
            <div className="text-center text-text-muted py-12">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p>Configuration Admin - À implémenter</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
