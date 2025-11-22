/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.2.0 - Backend Commands
 * Type-safe wrappers pour les 17 commandes Tauri backend
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  HeliosState,
  HealthStatus,
  NexusState,
  HarmoniaState,
  SentinelState,
  MemoryState,
  Snapshot,
  LogEntry,
  TimelineEvent,
  EvolutionReport,
  EvolutionState,
  SystemState,
} from './backend-v17.2.types';

/**
 * Utilitaire d'invocation avec gestion d'erreur
 */
async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    const result = await invoke<T>(cmd, args);
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Backend v17.2] Command "${cmd}" failed:`, errorMsg);
    throw new Error(`Backend command "${cmd}" failed: ${errorMsg}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// HELIOS API - System Monitoring (2 commands)
// ─────────────────────────────────────────────────────────────────

export const helios = {
  /**
   * Récupérer l'état actuel du monitoring système
   */
  async getState(): Promise<HeliosState> {
    return safeInvoke<HeliosState>('get_helios_state');
  },

  /**
   * Récupérer le statut de santé système global
   */
  async getHealth(): Promise<HealthStatus> {
    return safeInvoke<HealthStatus>('get_system_health');
  },
};

// ─────────────────────────────────────────────────────────────────
// MEMORY API - Unified Storage (6 commands)
// ─────────────────────────────────────────────────────────────────

export const memory = {
  /**
   * Récupérer l'état actuel du système mémoire
   */
  async getState(): Promise<MemoryState> {
    return safeInvoke<MemoryState>('get_memory_state');
  },

  /**
   * Écrire un snapshot complet du système
   */
  async writeSnapshot(snapshot: Snapshot): Promise<void> {
    return safeInvoke<void>('write_snapshot', { snapshot });
  },

  /**
   * Lire le dernier snapshot disponible
   */
  async readSnapshot(): Promise<Snapshot | null> {
    return safeInvoke<Snapshot | null>('read_snapshot');
  },

  /**
   * Écrire une entrée de log
   */
  async writeLog(entry: LogEntry): Promise<void> {
    return safeInvoke<void>('write_log', { entry });
  },

  /**
   * Lire les derniers logs (count maximum)
   */
  async readLogs(count: number): Promise<LogEntry[]> {
    return safeInvoke<LogEntry[]>('read_logs', { count });
  },

  /**
   * Ajouter un événement à la timeline
   */
  async addEvent(event: TimelineEvent): Promise<void> {
    return safeInvoke<void>('add_timeline_event', { event });
  },
};

// ─────────────────────────────────────────────────────────────────
// ENGINE API - Auto-Evolution (3 commands)
// ─────────────────────────────────────────────────────────────────

export const engine = {
  /**
   * Lancer un cycle d'évolution complet
   * (collect → diagnose → decide → repair → record)
   */
  async runEvolution(): Promise<EvolutionReport> {
    return safeInvoke<EvolutionReport>('run_evolution');
  },

  /**
   * Récupérer l'état de l'engine d'évolution
   */
  async getState(): Promise<EvolutionState> {
    return safeInvoke<EvolutionState>('get_evolution_state');
  },

  /**
   * Vérification rapide de santé (sans diagnostic complet)
   */
  async quickHealthCheck(): Promise<HealthStatus> {
    return safeInvoke<HealthStatus>('quick_health_check');
  },
};

// ─────────────────────────────────────────────────────────────────
// SYSTEM API - Full State (4 commands + 1 composite)
// ─────────────────────────────────────────────────────────────────

export const system = {
  /**
   * Récupérer l'état complet du système (tous modules)
   */
  async getFullState(): Promise<SystemState> {
    return safeInvoke<SystemState>('get_full_system_state');
  },

  /**
   * Récupérer l'état du module Nexus (cohérence)
   */
  async getNexusState(): Promise<NexusState> {
    return safeInvoke<NexusState>('get_nexus_state');
  },

  /**
   * Récupérer l'état du module Harmonia (équilibrage)
   */
  async getHarmoniaState(): Promise<HarmoniaState> {
    return safeInvoke<HarmoniaState>('get_harmonia_state');
  },

  /**
   * Récupérer l'état du module Sentinel (anomalies)
   */
  async getSentinelState(): Promise<SentinelState> {
    return safeInvoke<SentinelState>('get_sentinel_state');
  },
};

// ─────────────────────────────────────────────────────────────────
// COMPOSITE API - High-level operations
// ─────────────────────────────────────────────────────────────────

export const composite = {
  /**
   * Récupérer un dashboard complet (optimisé, 1 seul appel)
   */
  async getDashboard(): Promise<{
    system: SystemState;
    health: HealthStatus;
    evolution: EvolutionState;
  }> {
    // Paralléliser les appels indépendants
    const [system, health, evolution] = await Promise.all([
      safeInvoke<SystemState>('get_full_system_state'),
      safeInvoke<HealthStatus>('get_system_health'),
      safeInvoke<EvolutionState>('get_evolution_state'),
    ]);

    return { system, health, evolution };
  },

  /**
   * Créer un snapshot avec événement timeline (transaction atomique)
   */
  async captureSnapshot(description: string): Promise<Snapshot> {
    const state = await safeInvoke<SystemState>('get_full_system_state');
    
    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      helios: state.helios,
      nexus: state.nexus,
      harmonia: state.harmonia,
      sentinel: state.sentinel,
    };

    await safeInvoke<void>('write_snapshot', { snapshot });

    const event: TimelineEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      event_type: 'Custom',
      description,
      metadata: { snapshot_id: snapshot.id },
    };

    await safeInvoke<void>('add_timeline_event', { event });

    return snapshot;
  },

  /**
   * Logger une erreur avec contexte complet
   */
  async logError(module: string, message: string, context?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level: 'Error',
      module,
      message: context 
        ? `${message} | Context: ${JSON.stringify(context)}`
        : message,
    };

    await safeInvoke<void>('write_log', { entry });
  },
};

// ─────────────────────────────────────────────────────────────────
// EXPORT ALL
// ─────────────────────────────────────────────────────────────────

export const backendV17 = {
  helios,
  memory,
  engine,
  system,
  composite,
};

export default backendV17;
