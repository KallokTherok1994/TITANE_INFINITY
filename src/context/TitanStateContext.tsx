/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.MPE — TITAN STATE CONTEXT
 * Orchestrateur global d'état avec persistence automatique
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Architecture 100% SAVE:
 * - État centralisé (Single Source of Truth)
 * - Actions typées avec dispatch
 * - Persistence automatique via Tauri backend
 * - Auto-save: chaque modification + 30min + shutdown
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Événement TITANE pour persistence */
export interface TitanEvent {
  module: string;
  event_type: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/** Status de persistence */
export interface PersistenceStatus {
  events_persisted: number;
  snapshots_created: number;
  last_event: number | null;
  last_snapshot: number | null;
  last_integrity_check: number | null;
  integrity_ok: boolean;
  dirty: boolean;
  journal_size_bytes: number;
}

/** État XP/Progression */
export interface XPState {
  level: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  streakDays: number;
  lastActiveDate: string;
}

/** État Mémoire */
export interface MemoryState {
  totalMemories: number;
  activeMemories: number;
  lastRetrieval: number | null;
}

/** État Knowledge */
export interface KnowledgeState {
  totalEntries: number;
  indexedEntries: number;
  lastUpdate: number | null;
}

/** État Évolution */
export interface EvolutionState {
  version: string;
  phase: string;
  totalCycles: number;
  totalMutations: number;
}

/** État Settings */
export interface SettingsState {
  theme: string;
  language: string;
  audioEnabled: boolean;
  notificationsEnabled: boolean;
}

/** État global TITANE */
export interface TitanState {
  // Modules principaux
  xp: XPState;
  memory: MemoryState;
  knowledge: KnowledgeState;
  evolution: EvolutionState;
  settings: SettingsState;

  // Meta
  persistenceStatus: PersistenceStatus | null;
  initialized: boolean;
  lastSync: number;
  dirty: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type TitanAction =
  // XP Actions
  | { type: 'xp/add'; payload: { amount: number; source: string; description: string } }
  | { type: 'xp/set'; payload: Partial<XPState> }

  // Memory Actions
  | { type: 'memory/add'; payload: { content: string; category: string } }
  | { type: 'memory/clear'; payload: { category?: string } }
  | { type: 'memory/set'; payload: Partial<MemoryState> }

  // Knowledge Actions
  | { type: 'knowledge/add'; payload: { title: string; content: string; tags: string[] } }
  | { type: 'knowledge/set'; payload: Partial<KnowledgeState> }

  // Evolution Actions
  | { type: 'evolution/cycle'; payload: { mutationsApplied: number } }
  | { type: 'evolution/set'; payload: Partial<EvolutionState> }

  // Settings Actions
  | { type: 'settings/update'; payload: Partial<SettingsState> }

  // System Actions
  | { type: 'system/init'; payload: TitanState }
  | { type: 'system/sync'; payload: { persistenceStatus: PersistenceStatus } }
  | { type: 'system/markClean' }
  | { type: 'system/markDirty' };

// ═══════════════════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════════════════

const XP_PER_LEVEL = 500;

function titanReducer(state: TitanState, action: TitanAction): TitanState {
  let newState = state;

  switch (action.type) {
    // XP Actions
    case 'xp/add': {
      const newTotalXP = state.xp.totalXP + action.payload.amount;
      const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;
      const xpInCurrentLevel = newTotalXP % XP_PER_LEVEL;

      newState = {
        ...state,
        xp: {
          ...state.xp,
          totalXP: newTotalXP,
          level: newLevel,
          xpInCurrentLevel,
          xpToNextLevel: XP_PER_LEVEL - xpInCurrentLevel,
        },
        dirty: true,
      };
      break;
    }

    case 'xp/set':
      newState = {
        ...state,
        xp: { ...state.xp, ...action.payload },
        dirty: true,
      };
      break;

    // Memory Actions
    case 'memory/add':
      newState = {
        ...state,
        memory: {
          ...state.memory,
          totalMemories: state.memory.totalMemories + 1,
          activeMemories: state.memory.activeMemories + 1,
          lastRetrieval: Date.now(),
        },
        dirty: true,
      };
      break;

    case 'memory/clear':
      newState = {
        ...state,
        memory: {
          ...state.memory,
          totalMemories: action.payload.category ? state.memory.totalMemories : 0,
          activeMemories: 0,
        },
        dirty: true,
      };
      break;

    case 'memory/set':
      newState = {
        ...state,
        memory: { ...state.memory, ...action.payload },
        dirty: true,
      };
      break;

    // Knowledge Actions
    case 'knowledge/add':
      newState = {
        ...state,
        knowledge: {
          ...state.knowledge,
          totalEntries: state.knowledge.totalEntries + 1,
          lastUpdate: Date.now(),
        },
        dirty: true,
      };
      break;

    case 'knowledge/set':
      newState = {
        ...state,
        knowledge: { ...state.knowledge, ...action.payload },
        dirty: true,
      };
      break;

    // Evolution Actions
    case 'evolution/cycle':
      newState = {
        ...state,
        evolution: {
          ...state.evolution,
          totalCycles: state.evolution.totalCycles + 1,
          totalMutations: state.evolution.totalMutations + action.payload.mutationsApplied,
        },
        dirty: true,
      };
      break;

    case 'evolution/set':
      newState = {
        ...state,
        evolution: { ...state.evolution, ...action.payload },
        dirty: true,
      };
      break;

    // Settings Actions
    case 'settings/update':
      newState = {
        ...state,
        settings: { ...state.settings, ...action.payload },
        dirty: true,
      };
      break;

    // System Actions
    case 'system/init':
      newState = {
        ...action.payload,
        initialized: true,
        dirty: false,
      };
      break;

    case 'system/sync':
      newState = {
        ...state,
        persistenceStatus: action.payload.persistenceStatus,
        lastSync: Date.now(),
      };
      break;

    case 'system/markClean':
      newState = { ...state, dirty: false };
      break;

    case 'system/markDirty':
      newState = { ...state, dirty: true };
      break;

    default:
      return state;
  }

  return newState;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════════

const initialState: TitanState = {
  xp: {
    level: 1,
    totalXP: 0,
    xpInCurrentLevel: 0,
    xpToNextLevel: XP_PER_LEVEL,
    streakDays: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
  },
  memory: {
    totalMemories: 0,
    activeMemories: 0,
    lastRetrieval: null,
  },
  knowledge: {
    totalEntries: 0,
    indexedEntries: 0,
    lastUpdate: null,
  },
  evolution: {
    version: '19.3.0',
    phase: 'nascent',
    totalCycles: 0,
    totalMutations: 0,
  },
  settings: {
    theme: 'dark',
    language: 'fr',
    audioEnabled: true,
    notificationsEnabled: true,
  },
  persistenceStatus: null,
  initialized: false,
  lastSync: 0,
  dirty: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

interface TitanContextValue {
  state: TitanState;
  dispatch: (action: TitanAction) => void;
  persistEvent: (event: TitanEvent) => Promise<void>;
  forceSnapshot: () => Promise<void>;
  checkIntegrity: () => Promise<boolean>;
  getPersistenceStatus: () => Promise<PersistenceStatus | null>;
}

const TitanContext = createContext<TitanContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface TitanProviderProps {
  children: React.ReactNode;
}

export function TitanStateProvider({ children }: TitanProviderProps) {
  const [state, baseDispatch] = useReducer(titanReducer, initialState);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPersistRef = useRef<number>(0);

  // Dispatch avec persistence automatique
  const dispatch = useCallback(async (action: TitanAction) => {
    // Appliquer l'action au reducer
    baseDispatch(action);

    // Persister les actions importantes
    if (action.type !== 'system/init' && action.type !== 'system/sync' && action.type !== 'system/markClean') {
      const event: TitanEvent = {
        module: action.type.split('/')[0],
        event_type: action.type.split('/')[1],
        payload: 'payload' in action ? action.payload as Record<string, unknown> : {},
      };

      try {
        await invoke('titan_persist_event', { event });
        lastPersistRef.current = Date.now();
        console.log('[TitanState] ✅ Event persisté:', action.type);
      } catch (error) {
        console.error('[TitanState] ❌ Erreur persistence:', error);
      }
    }
  }, []);

  // Persist event directement
  const persistEvent = useCallback(async (event: TitanEvent) => {
    try {
      await invoke('titan_persist_event', { event });
      lastPersistRef.current = Date.now();
    } catch (error) {
      console.error('[TitanState] ❌ Erreur persistEvent:', error);
    }
  }, []);

  // Force snapshot
  const forceSnapshot = useCallback(async () => {
    try {
      const stateJson = JSON.stringify(state);
      await invoke('titan_force_snapshot', { stateJson });
      baseDispatch({ type: 'system/markClean' });
      console.log('[TitanState] 📸 Snapshot forcé créé');
    } catch (error) {
      console.error('[TitanState] ❌ Erreur forceSnapshot:', error);
    }
  }, [state]);

  // Check integrity
  const checkIntegrity = useCallback(async (): Promise<boolean> => {
    try {
      const report = await invoke<{ is_valid: boolean }>('titan_check_integrity');
      return report?.is_valid ?? false;
    } catch (error) {
      console.error('[TitanState] ❌ Erreur checkIntegrity:', error);
      return false;
    }
  }, []);

  // Get persistence status
  const getPersistenceStatus = useCallback(async (): Promise<PersistenceStatus | null> => {
    try {
      return await invoke<PersistenceStatus>('titan_get_persistence_status');
    } catch (error) {
      console.error('[TitanState] ❌ Erreur getPersistenceStatus:', error);
      return null;
    }
  }, []);

  // Initialisation
  useEffect(() => {
    const init = async () => {
      try {
        // Initialiser le moteur de persistence
        await invoke('titan_persistence_init');
        console.log('[TitanState] 🚀 Persistence initialisée');

        // Charger l'état sauvegardé
        const savedState = await invoke<TitanState | null>('titan_load_state');
        if (savedState) {
          baseDispatch({ type: 'system/init', payload: { ...initialState, ...savedState } });
          console.log('[TitanState] 📂 État restauré depuis persistence');
        } else {
          baseDispatch({ type: 'system/init', payload: initialState });
          console.log('[TitanState] 🆕 Nouvel état initialisé');
        }
      } catch (error) {
        console.error('[TitanState] ❌ Erreur init:', error);
        baseDispatch({ type: 'system/init', payload: initialState });
      }
    };

    init();
  }, []);

  // Auto-save toutes les 30 minutes
  useEffect(() => {
    const THIRTY_MINUTES = 30 * 60 * 1000;

    autoSaveTimerRef.current = setInterval(async () => {
      if (state.dirty) {
        console.log('[TitanState] ⏰ Auto-save 30min...');
        await forceSnapshot();
      }
    }, THIRTY_MINUTES);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [state.dirty, forceSnapshot]);

  // Écouter les événements de fermeture
  useEffect(() => {
    const setupShutdownListener = async () => {
      try {
        const unlisten = await listen('tauri://close-requested', async () => {
          console.log('[TitanState] 🛑 Fermeture détectée - sauvegarde finale...');
          if (state.dirty) {
            await forceSnapshot();
          }
          await invoke('titan_persistence_shutdown');
        });

        return unlisten;
      } catch (error) {
        console.warn('[TitanState] ⚠️ Impossible d\'écouter close-requested:', error);
        return () => {};
      }
    };

    const unlistenPromise = setupShutdownListener();

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [state.dirty, forceSnapshot]);

  const value: TitanContextValue = {
    state,
    dispatch,
    persistEvent,
    forceSnapshot,
    checkIntegrity,
    getPersistenceStatus,
  };

  return (
    <TitanContext.Provider value={value}>
      {children}
    </TitanContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/** Hook principal pour accéder à l'état TITANE */
export function useTitanState() {
  const context = useContext(TitanContext);
  if (!context) {
    throw new Error('useTitanState must be used within a TitanStateProvider');
  }
  return context;
}

/** Hook pour l'XP uniquement */
export function useTitanXP() {
  const { state, dispatch } = useTitanState();

  const addXP = useCallback((amount: number, source: string, description: string) => {
    dispatch({ type: 'xp/add', payload: { amount, source, description } });
  }, [dispatch]);

  return {
    ...state.xp,
    addXP,
  };
}

/** Hook pour la mémoire uniquement */
export function useTitanMemory() {
  const { state, dispatch } = useTitanState();

  const addMemory = useCallback((content: string, category: string) => {
    dispatch({ type: 'memory/add', payload: { content, category } });
  }, [dispatch]);

  const clearMemory = useCallback((category?: string) => {
    dispatch({ type: 'memory/clear', payload: { category } });
  }, [dispatch]);

  return {
    ...state.memory,
    addMemory,
    clearMemory,
  };
}

/** Hook pour les settings uniquement */
export function useTitanSettings() {
  const { state, dispatch } = useTitanState();

  const updateSettings = useCallback((settings: Partial<SettingsState>) => {
    dispatch({ type: 'settings/update', payload: settings });
  }, [dispatch]);

  return {
    ...state.settings,
    updateSettings,
  };
}

/** Hook pour le status de persistence */
export function usePersistenceStatus() {
  const { state, getPersistenceStatus, checkIntegrity, forceSnapshot } = useTitanState();

  return {
    status: state.persistenceStatus,
    dirty: state.dirty,
    lastSync: state.lastSync,
    getPersistenceStatus,
    checkIntegrity,
    forceSnapshot,
  };
}

export default TitanStateProvider;
