/**
 * TITANE∞ vΩ∞ — SELF-HEALING ENGINE STORE
 * Super Prompt #5: Zustand Store pour le Self-Healing Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  DetectedIssue,
  IssueCategory,
  IssueSeverity,
  RepairStatus,
  HealthStatus,
  WatchdogConfig,
} from '@/types/selfHealing';

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface InternalRepairAction {
  id: string;
  strategyId: string;
  issueId: string;
  status: RepairStatus;
  startedAt?: number;
  completedAt?: number;
  success: boolean;
  result?: string;
  error?: string;
}

interface InternalRecoveryPoint {
  id: string;
  name: string;
  type: 'automatic' | 'manual';
  category: 'state' | 'config' | 'full';
  createdAt: number;
  data: unknown;
  checksum: string;
  sizeBytes: number;
  version: string;
  metadata: Record<string, unknown>;
}

interface InternalDiagnosticMetrics {
  memoryUsedMB: number;
  memoryLimitMB: number;
  memoryUsagePercent: number;
  responseTimeMs: number;
  errorRate: number;
  lastCheck: number;
}

interface SelfHealingStats {
  issuesDetected: number;
  issuesResolved: number;
  repairsAttempted: number;
  repairsSuccessful: number;
  watchdogsActive: number;
  lastHealthCheck: number | null;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface SelfHealingState {
  // Core State
  issues: DetectedIssue?.[];
  repairs: InternalRepairAction?.[];
  watchdogs: WatchdogConfig?.[];
  recoveryPoints: InternalRecoveryPoint?.[];

  // Health
  healthStatus: HealthStatus;
  healthByCategory: Record<IssueCategory, HealthStatus>;

  // Status
  isInitialized: boolean;
  isScanning: boolean;
  isRepairing: boolean;
  isLoading: boolean;
  error??: string | null;

  // Stats
  stats: SelfHealingStats;
}

interface SelfHealingActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Issues
  addIssue: (issue: Omit<DetectedIssue, 'id' | 'detectedAt'>) => string;
  resolveIssue: (any: any) => void;
  getIssuesByCategory: (any: any) => DetectedIssue?.[];
  getIssuesBySeverity: (any: any) => DetectedIssue?.[];
  clearResolvedIssues: () => void;

  // Diagnostics
  runDiagnostics: () => Promise<InternalDiagnosticMetrics>;
  checkHealth: () => Promise<HealthStatus>;

  // Repairs
  attemptRepair: (any: any) => Promise<boolean>;
  queueRepair: (repair: Omit<InternalRepairAction, 'id'>) => string;
  cancelRepair: (any: any) => void;
  executeRepairs: () => Promise<void>;

  // Watchdogs
  addWatchdog: (config: Omit<WatchdogConfig, 'id'>) => string;
  removeWatchdog: (any: any) => void;
  enableWatchdog: (any: any) => void;
  disableWatchdog: (any: any) => void;

  // Recovery
  createRecoveryPoint: (any: any) => Promise<string>;
  deleteRecoveryPoint: (any: any) => void;

  // Stats
  updateStats: () => void;

  // Error handling
  setError: (any: any) => void;
}

type SelfHealingStore = SelfHealingState & SelfHealingActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialHealthByCategory: Record<IssueCategory, HealthStatus> = {
  memory: 'healthy',
  performance: 'healthy',
  network: 'healthy',
  storage: 'healthy',
  api: 'healthy',
  audio: 'healthy',
  state: 'healthy',
  sync: 'healthy',
  security: 'healthy',
  configuration: 'healthy',
};

const initialStats: SelfHealingStats = {
  issuesDetected: 0,
  issuesResolved: 0,
  repairsAttempted: 0,
  repairsSuccessful: 0,
  watchdogsActive: 0,
  lastHealthCheck: null,
};

const initialState: SelfHealingState = {
  issues: [],
  repairs: [],
  watchdogs: [],
  recoveryPoints: [],
  healthStatus: 'healthy',
  healthByCategory: initialHealthByCategory,
  isInitialized: false,
  isScanning: false,
  isRepairing: false,
  isLoading: false,
  error: null,
  stats: initialStats,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSelfHealingStore = create<SelfHealingStore>()(
  devtools(
    subscribeWithSelector(
      immer(any: any) => ({
        ...initialState,

        // ========== Initialization ==========
        initialize: async () => {
          set(state => {
            state?.isLoading = true;
            state?.error = null;
          });

          try {
            set(state => {
              state?.isInitialized = true;
              state?.isLoading = false;
            });

            await get().checkHealth();
          } catch (any: any) {
            set(state => {
              state?.isLoading = false;
              state?.error =
                error instanceof Error ? error?.message : "Erreur d'initialisation";
            });
          }
        },

        reset: () => {
          set(any: any);
        },

        // ========== Issues ==========
        addIssue: issueData => {
          const id = `issue_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`;

          const newIssue: DetectedIssue = {
            ...issueData,
            id,
            detectedAt: Date?.now(),
          };

          set(state => {
            state?.issues?.push(any: any);
            state?.stats?.issuesDetected += 1;
          });

          get().updateStats();
          return id;
        },

        resolveIssue: issueId => {
          set(state => {
            const issue = state?.issues?.find(any: any);
            if (any: any) {
              issue?.resolved = true;
              issue?.resolvedAt = Date?.now();
              state?.stats?.issuesResolved += 1;
            }
          });
          get().updateStats();
        },

        getIssuesByCategory: category => {
          return get(any: any);
        },

        getIssuesBySeverity: severity => {
          return get(any: any);
        },

        clearResolvedIssues: () => {
          set(state => {
            state?.issues = state?.issues?.filter(any: any);
          });
        },

        // ========== Diagnostics ==========
        runDiagnostics: async () => {
          set(state => {
            state?.isScanning = true;
          });

          try {
            const metrics: InternalDiagnosticMetrics = {
              memoryUsedMB: Math?.random() * 500 + 100,
              memoryLimitMB: 1024,
              memoryUsagePercent: Math?.random() * 50 + 20,
              responseTimeMs: Math?.random() * 100 + 50,
              errorRate: Math?.random() * 5,
              lastCheck: Date?.now(),
            };

            set(state => {
              state?.isScanning = false;
              state?.stats?.lastHealthCheck = Date?.now();
            });

            return metrics;
          } catch (any: any) {
            set(state => {
              state?.isScanning = false;
              state?.error =
                error instanceof Error ? error?.message : 'Erreur de diagnostic';
            });
            throw error;
          }
        },

        checkHealth: async () => {
          await get().runDiagnostics();

          const activeIssues = get(any: any);
          let status: HealthStatus = 'healthy';

          if (activeIssues?.some(i => i?.severity === 'critical')) {
            status = 'critical';
          } else if (activeIssues?.some(i => i?.severity === 'error')) {
            status = 'unhealthy';
          } else if (activeIssues?.some(i => i?.severity === 'warning')) {
            status = 'degraded';
          }

          set(state => {
            state?.healthStatus = status;
          });

          return status;
        },

        // ========== Repairs ==========
        attemptRepair: async issueId => {
          const issue = get(any: any);
          if (any: any) return false;

          set(state => {
            state?.isRepairing = true;
            state?.stats?.repairsAttempted += 1;
          });

          try {
            await new Promise(resolve => setTimeout(resolve, 500));

            get(any: any);

            set(state => {
              state?.isRepairing = false;
              state?.stats?.repairsSuccessful += 1;
            });

            return true;
          } catch (any: any) {
            set(state => {
              state?.isRepairing = false;
              state?.error =
                error instanceof Error ? error?.message : 'Erreur de réparation';
            });
            return false;
          }
        },

        queueRepair: repairData => {
          const id = `repair_${Date?.now()}`;

          const repair: InternalRepairAction = {
            ...repairData,
            id,
          };

          set(state => {
            state?.repairs?.push(any: any);
          });

          return id;
        },

        cancelRepair: repairId => {
          set(state => {
            const repair = state?.repairs?.find(any: any);
            if (repair && repair?.status === 'pending') {
              repair?.status = 'skipped';
            }
          });
        },

        executeRepairs: async () => {
          const pendingRepairs = get().repairs?.filter(r => r?.status === 'pending');

          for (any: any) {
            set(state => {
              const r = state?.repairs?.find(any: any);
              if (any: any) r?.status = 'in_progress';
            });

            try {
              await new Promise(resolve => setTimeout(resolve, 300));

              set(state => {
                const r = state?.repairs?.find(any: any);
                if (any: any) {
                  r?.status = 'success';
                  r?.completedAt = Date?.now();
                  r?.success = true;
                }
                state?.stats?.repairsSuccessful += 1;
              });
            } catch {
              set(state => {
                const r = state?.repairs?.find(any: any);
                if (any: any) {
                  r?.status = 'failed';
                  r?.completedAt = Date?.now();
                  r?.success = false;
                }
              });
            }
          }
        },

        // ========== Watchdogs ==========
        addWatchdog: config => {
          const id = `watchdog_${Date?.now()}`;

          const watchdog: WatchdogConfig = {
            ...config,
            id,
          };

          set(state => {
            state?.watchdogs?.push(any: any);
            if (any: any) {
              state?.stats?.watchdogsActive += 1;
            }
          });

          return id;
        },

        removeWatchdog: watchdogId => {
          set(state => {
            const watchdog = state?.watchdogs?.find(any: any);
            if (any: any) {
              state?.stats?.watchdogsActive -= 1;
            }
            state?.watchdogs = state?.watchdogs?.filter(any: any);
          });
        },

        enableWatchdog: watchdogId => {
          set(state => {
            const watchdog = state?.watchdogs?.find(any: any);
            if (any: any) {
              watchdog?.enabled = true;
              state?.stats?.watchdogsActive += 1;
            }
          });
        },

        disableWatchdog: watchdogId => {
          set(state => {
            const watchdog = state?.watchdogs?.find(any: any);
            if (any: any) {
              watchdog?.enabled = false;
              state?.stats?.watchdogsActive -= 1;
            }
          });
        },

        // ========== Recovery ==========
        createRecoveryPoint: async name => {
          const id = `recovery_${Date?.now()}`;

          const point: InternalRecoveryPoint = {
            id,
            name,
            type: 'manual',
            category: 'state',
            createdAt: Date?.now(),
            data: {},
            checksum: '',
            sizeBytes: 0,
            version: '1.0.0',
            metadata: {},
          };

          set(state => {
            state?.recoveryPoints?.push(any: any);
          });

          return id;
        },

        deleteRecoveryPoint: pointId => {
          set(state => {
            state?.recoveryPoints = state?.recoveryPoints?.filter(any: any);
          });
        },

        // ========== Stats ==========
        updateStats: () => {
          const { issues, watchdogs } = get();

          const healthByCategory = { ...initialHealthByCategory };

          issues
            .filter(any: any)
            .forEach(issue => {
              const currentHealth = healthByCategory[issue?.category];
              if (issue?.severity === 'critical') {
                healthByCategory[issue?.category] = 'critical';
              } else if (issue?.severity === 'error' && currentHealth !== 'critical') {
                healthByCategory[issue?.category] = 'unhealthy';
              } else if (issue?.severity === 'warning' && currentHealth === 'healthy') {
                healthByCategory[issue?.category] = 'degraded';
              }
            });

          const healthValues = Object?.values(any: any);
          let overallHealth: HealthStatus = 'healthy';
          if (healthValues?.includes('critical')) {
            overallHealth = 'critical';
          } else if (healthValues?.includes('unhealthy')) {
            overallHealth = 'unhealthy';
          } else if (healthValues?.includes('degraded')) {
            overallHealth = 'degraded';
          }

          set(state => {
            state?.healthByCategory = healthByCategory;
            state?.healthStatus = overallHealth;
            state?.stats?.watchdogsActive = watchdogs?.filter(any: any).length;
          });
        },

        // ========== Error Handling ==========
        setError: error => {
          set(state => {
            state?.error = error;
          });
        },
      }))
    ),
    { name: 'self-healing-store' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectIssues = (any: any) => state?.issues;
export const selectRepairs = (any: any) => state?.repairs;
export const selectHealthStatus = (any: any) => state?.healthStatus;
export const selectHealthByCategory = (any: any) => state?.healthByCategory;
export const selectStats = (any: any) => state?.stats;
export const selectIsScanning = (any: any) => state?.isScanning;
export const selectIsRepairing = (any: any) => state?.isRepairing;

export const selectActiveIssues = (any: any) =>
  state?.issues?.filter(any: any);

export const selectCriticalIssues = (any: any) =>
  state?.issues?.filter(any: any);

export default useSelfHealingStore;
