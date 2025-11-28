/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — OMNIS UI STATE MANAGER (FAULT-TOLERANT v1.0)
 *   PHASE 5 OMNIS: State preservation • UI recovery • Global resilience
 *   Architecture: Context-Provider → State-Backup → Recovery-Manager → Persistence
 *   Garantit état UI indestructible avec récupération automatique
 * ══════════════════════════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────
// TYPES OMNIS UI STATE
// ─────────────────────────────────────────────────────────────────

interface OmnisUIState {
  // Core UI State
  isLoading: boolean;
  errors: Array<{
    id: string;
    component: string;
    message: string;
    timestamp: number;
    level: 'critical' | 'important' | 'minor';
  }>;

  // Recovery State
  degradedComponents: Set<string>;
  recoveryCount: number;
  lastRecoveryTimestamp: number;

  // Backup State
  hasStateBackup: boolean;
  backupTimestamp: number;

  // Health Metrics
  uiHealth: number; // 0-100
  componentHealth: Map<string, number>;

  // Session Info
  sessionId: string;
  startTime: number;
}

interface OmnisUIAction {
  type: 'COMPONENT_ERROR' | 'COMPONENT_RECOVERY' | 'SET_DEGRADED' | 'CLEAR_DEGRADED'
       | 'UPDATE_HEALTH' | 'BACKUP_STATE' | 'RESTORE_STATE' | 'RESET';
  payload?: any;
}

interface OmnisUIContextType {
  state: OmnisUIState;
  dispatch: (action: OmnisUIAction) => void;

  // Helper functions
  reportComponentError: (component: string, error: Error, level?: 'critical' | 'important' | 'minor') => void;
  reportComponentRecovery: (component: string) => void;
  setDegradedMode: (component: string, degraded: boolean) => void;
  backupCurrentState: () => void;
  restoreFromBackup: () => boolean;
  getComponentHealth: (component: string) => number;
  getOverallHealth: () => number;
  resetOmnisState: () => void;
}

// ─────────────────────────────────────────────────────────────────
// OMNIS UI STATE REDUCER
// ─────────────────────────────────────────────────────────────────

function omnisUIReducer(state: OmnisUIState, action: OmnisUIAction): OmnisUIState {
  switch (action.type) {
    case 'COMPONENT_ERROR': {
      const { component, error, level = 'important' } = action.payload;
      const newError = {
        id: `${component}-${Date.now()}`,
        component,
        message: error.message || 'Unknown error',
        timestamp: Date.now(),
        level
      };

      return {
        ...state,
        errors: [...state.errors.slice(-19), newError], // Keep last 20 errors
        degradedComponents: new Set([...state.degradedComponents, component]),
        uiHealth: Math.max(0, state.uiHealth - (level === 'critical' ? 20 : level === 'important' ? 10 : 5))
      };
    }

    case 'COMPONENT_RECOVERY': {
      const { component } = action.payload;
      const newDegraded = new Set(state.degradedComponents);
      newDegraded.delete(component);

      return {
        ...state,
        degradedComponents: newDegraded,
        recoveryCount: state.recoveryCount + 1,
        lastRecoveryTimestamp: Date.now(),
        uiHealth: Math.min(100, state.uiHealth + 10) // Recovery improves health
      };
    }

    case 'SET_DEGRADED': {
      const { component, degraded } = action.payload;
      const newDegraded = new Set(state.degradedComponents);

      if (degraded) {
        newDegraded.add(component);
      } else {
        newDegraded.delete(component);
      }

      return {
        ...state,
        degradedComponents: newDegraded
      };
    }

    case 'CLEAR_DEGRADED': {
      return {
        ...state,
        degradedComponents: new Set()
      };
    }

    case 'UPDATE_HEALTH': {
      const { component, health } = action.payload;
      const newComponentHealth = new Map(state.componentHealth);
      newComponentHealth.set(component, health);

      // Calculate overall health as average of component healths
      const healths = Array.from(newComponentHealth.values());
      const avgHealth = healths.length > 0
        ? healths.reduce((sum, h) => sum + h, 0) / healths.length
        : 100;

      return {
        ...state,
        componentHealth: newComponentHealth,
        uiHealth: Math.round(avgHealth)
      };
    }

    case 'BACKUP_STATE': {
      return {
        ...state,
        hasStateBackup: true,
        backupTimestamp: Date.now()
      };
    }

    case 'RESTORE_STATE': {
      const { restoredState } = action.payload;
      return {
        ...state,
        ...restoredState,
        lastRecoveryTimestamp: Date.now()
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────
// INITIAL STATE FACTORY
// ─────────────────────────────────────────────────────────────────

function createInitialState(): OmnisUIState {
  return {
    isLoading: false,
    errors: [],
    degradedComponents: new Set(),
    recoveryCount: 0,
    lastRecoveryTimestamp: 0,
    hasStateBackup: false,
    backupTimestamp: 0,
    uiHealth: 100,
    componentHealth: new Map(),
    sessionId: generateSessionId(),
    startTime: Date.now()
  };
}

function generateSessionId(): string {
  return `omnis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ─────────────────────────────────────────────────────────────────
// OMNIS UI CONTEXT
// ─────────────────────────────────────────────────────────────────

const OmnisUIContext = createContext<OmnisUIContextType | null>(null);

export function OmnisUIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(omnisUIReducer, createInitialState());

  // Periodic state backup
  useEffect(() => {
    const backupInterval = setInterval(() => {
      backupCurrentState();
    }, 30000); // Backup every 30 seconds

    return () => clearInterval(backupInterval);
  }, []);

  // Cleanup old errors
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      const recentErrors = state.errors.filter(error => error.timestamp > oneHourAgo);

      if (recentErrors.length !== state.errors.length) {
        dispatch({
          type: 'COMPONENT_ERROR',
          payload: { errors: recentErrors }
        });
      }
    }, 300000); // Cleanup every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [state.errors]);

  // Helper Functions
  const reportComponentError = useCallback((
    component: string,
    error: Error,
    level: 'critical' | 'important' | 'minor' = 'important'
  ) => {
    dispatch({
      type: 'COMPONENT_ERROR',
      payload: { component, error, level }
    });
  }, []);

  const reportComponentRecovery = useCallback((component: string) => {
    dispatch({
      type: 'COMPONENT_RECOVERY',
      payload: { component }
    });
  }, []);

  const setDegradedMode = useCallback((component: string, degraded: boolean) => {
    dispatch({
      type: 'SET_DEGRADED',
      payload: { component, degraded }
    });
  }, []);

  const backupCurrentState = useCallback(() => {
    try {
      const stateBackup = {
        timestamp: Date.now(),
        sessionId: state.sessionId,
        errors: state.errors,
        recoveryCount: state.recoveryCount,
        componentHealth: Array.from(state.componentHealth.entries()),
        uiHealth: state.uiHealth
      };

      localStorage.setItem('omnis-ui-state-backup', JSON.stringify(stateBackup));
      sessionStorage.setItem('omnis-ui-state-session', JSON.stringify(stateBackup));

      dispatch({ type: 'BACKUP_STATE' });

    } catch (error) {
      console.warn('[OMNIS UI] State backup failed:', error);
    }
  }, [state]);

  const restoreFromBackup = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem('omnis-ui-state-backup');
      if (!stored) return false;

      const backup = JSON.parse(stored);

      // Only restore if backup is less than 24 hours old
      if (Date.now() - backup.timestamp > 86400000) {
        return false;
      }

      const restoredState = {
        errors: backup.errors || [],
        recoveryCount: backup.recoveryCount || 0,
        componentHealth: new Map(backup.componentHealth || []),
        uiHealth: backup.uiHealth || 100
      };

      dispatch({
        type: 'RESTORE_STATE',
        payload: { restoredState }
      });

      return true;
    } catch (error) {
      console.warn('[OMNIS UI] State restore failed:', error);
      return false;
    }
  }, []);

  const getComponentHealth = useCallback((component: string): number => {
    return state.componentHealth.get(component) || 100;
  }, [state.componentHealth]);

  const getOverallHealth = useCallback((): number => {
    return state.uiHealth;
  }, [state.uiHealth]);

  const resetOmnisState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const contextValue: OmnisUIContextType = {
    state,
    dispatch,
    reportComponentError,
    reportComponentRecovery,
    setDegradedMode,
    backupCurrentState,
    restoreFromBackup,
    getComponentHealth,
    getOverallHealth,
    resetOmnisState
  };

  return (
    <OmnisUIContext.Provider value={contextValue}>
      {children}
    </OmnisUIContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────
// OMNIS UI HOOKS
// ─────────────────────────────────────────────────────────────────

export function useOmnisUI(): OmnisUIContextType {
  const context = useContext(OmnisUIContext);
  if (!context) {
    throw new Error('useOmnisUI must be used within OmnisUIProvider');
  }
  return context;
}

export function useOmnisComponentHealth(componentName: string) {
  const { getComponentHealth, reportComponentError, reportComponentRecovery, setDegradedMode } = useOmnisUI();

  const reportError = useCallback((error: Error, level?: 'critical' | 'important' | 'minor') => {
    reportComponentError(componentName, error, level);
  }, [componentName, reportComponentError]);

  const reportRecovery = useCallback(() => {
    reportComponentRecovery(componentName);
  }, [componentName, reportComponentRecovery]);

  const setDegraded = useCallback((degraded: boolean) => {
    setDegradedMode(componentName, degraded);
  }, [componentName, setDegradedMode]);

  return {
    health: getComponentHealth(componentName),
    reportError,
    reportRecovery,
    setDegraded
  };
}

// ─────────────────────────────────────────────────────────────────
// OMNIS UI HOC FOR COMPONENT HEALTH TRACKING
// ─────────────────────────────────────────────────────────────────

export function withOmnisHealthTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    const { reportError, reportRecovery } = useOmnisComponentHealth(name);

    useEffect(() => {
      // Report component mount as recovery
      reportRecovery();

      return () => {
        // Component unmount - could indicate error or normal cleanup
      };
    }, [reportRecovery]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withOmnisHealthTracking(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Export types for external use
export type { OmnisUIState, OmnisUIAction, OmnisUIContextType };
