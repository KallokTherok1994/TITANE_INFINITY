/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🛡️ TAURI INVOKE PROTECTION PATCH
 * Correction des erreurs "Cannot read properties of undefined (reading 'invoke')"
 */

import type {
  AdaptiveLayer,
  CognitiveLayer,
  MetaLayer,
  PhysicalLayer,
  SingularityState,
  SymbolicLayer,
} from '@/types/singularityState';

type TauriCoreBridge = {
  core?: {
    invoke?: (command: string, args?: any) => Promise<any>;
  };
};

export const createFallbackPhysical = (): PhysicalLayer => {
  const now = Date.now();
  return {
    helios: {
      active: false,
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      temperature: 0,
      battery_level: null,
      last_update: now,
    },
    system_health: {
      global_health: 0.5,
      services_running: 0,
      errors_count: 0,
      warnings_count: 0,
      uptime: 0,
    },
    metrics: {
      cpu_usage: 0,
      memory_usage: 0,
      fps: 0,
      latency: 0,
      performance_score: 0.5,
    },
  };
};

export const createFallbackCognitive = (): CognitiveLayer => {
  const now = Date.now();
  return {
    memory: {
      total_memories: 0,
      active_memories: 0,
      memory_usage: 0,
      last_retrieval: now,
      compression_ratio: 1,
    },
    conversation: {
      active_session: false,
      message_count: 0,
      context_length: 0,
      last_message: null,
      last_timestamp: null,
    },
    knowledge: {
      total_entries: 0,
      indexed_entries: 0,
      knowledge_score: 0,
      last_update: now,
    },
    coherence: 0.5,
  };
};

export const createFallbackSymbolic = (): SymbolicLayer => {
  const now = Date.now();
  return {
    persona: {
      name: 'TITANE∞ (offline)',
      mood: 'neutral',
      intensity: 0.25,
      evolution_level: 1,
      last_interaction: now,
    },
    archetype: {
      active_archetype: 'sentinel',
      strength: 0.35,
      transition: null,
    },
    visual: {
      theme: 'dark',
      accent_color: '#6366f1',
      glow_intensity: 0.2,
      motion_enabled: false,
      depth_enabled: false,
    },
    stability: 0.6,
  };
};

export const createFallbackAdaptive = (): AdaptiveLayer => {
  const now = Date.now();
  return {
    evolution: {
      generation: 0,
      mutation_rate: 0,
      fitness_score: 0.5,
      last_evolution: now,
    },
    auto_heal: {
      active: false,
      healing_capacity: 0.25,
      errors_healed: 0,
      last_heal: null,
    },
    evolution_capacity: 0.3,
  };
};

export const createFallbackMeta = (): MetaLayer => {
  const now = Date.now();
  const activePath = typeof window !== 'undefined' ? window.location.pathname : '/';
  return {
    ui: {
      active_page: activePath,
      sidebar_open: false,
      modal_open: false,
      theme: 'dark',
      last_interaction: now,
    },
    runtime: {
      version: 'dev-offline',
      build: 'web-fallback',
      environment: import.meta.env.MODE,
      uptime: 0,
      restart_count: 0,
    },
    runtime_health: 0.4,
  };
};

export const createFallbackSingularityState = (): SingularityState => {
  const now = Date.now();
  return {
    physical: createFallbackPhysical(),
    cognitive: createFallbackCognitive(),
    symbolic: createFallbackSymbolic(),
    adaptive: createFallbackAdaptive(),
    meta: createFallbackMeta(),
    progression: {
      xp: 0,
      level: 1,
      events: [],
    },
    timestamp: now,
    signature: 'web-fallback-state',
  };
};

const getTauriGlobal = (): TauriCoreBridge | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const candidate = (window as typeof window & { __TAURI__?: unknown }).__TAURI__;
  if (candidate && typeof candidate === 'object') {
    return candidate as TauriCoreBridge;
  }
  return undefined;
};

/**
 * Protection robuste pour les appels Tauri invoke
 */
export class TauriInvokeProtector {
  private static instance: TauriInvokeProtector;
  private isTauriAvailable: boolean | null = null;
  private checkCache: { [key: string]: { result: any; timestamp: number } } = {};
  private readonly CACHE_DURATION = 5000; // 5s cache
  private readonly isTestEnv: boolean =
    (typeof process !== 'undefined' && Boolean(process.env?.VITEST_WORKER_ID)) ||
    (typeof globalThis !== 'undefined' && Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__));

  static getInstance(): TauriInvokeProtector {
    if (!TauriInvokeProtector.instance) {
      TauriInvokeProtector.instance = new TauriInvokeProtector();
    }
    return TauriInvokeProtector.instance;
  }

  /**
   * Expose Tauri availability for callers needing a quick check.
   */
  isAvailable(): boolean {
    if (this.isTauriAvailable === true) {
      return true;
    }
    return this.syncCheckTauriAvailability();
  }

  /**
   * Vérifie si Tauri est disponible dans l'environnement actuel
   */
  private syncCheckTauriAvailability(): boolean {
    if (this.isTauriAvailable === true) {
      return true;
    }

    try {
      if (typeof window === 'undefined') {
        this.isTauriAvailable = false;
        return false;
      }

      const tauriGlobal = getTauriGlobal();
      const internals = (window as typeof window & { __TAURI_INTERNALS__?: { invoke?: unknown } }).__TAURI_INTERNALS__;
      const hasInvoke =
        typeof tauriGlobal?.core?.invoke === 'function' ||
        typeof internals?.invoke === 'function';

      if (hasInvoke) {
        this.isTauriAvailable = true;
        return true;
      }

      return false;
    } catch (error) {
      console.warn('[TauriProtector] Error checking Tauri availability:', error);
      this.isTauriAvailable = false;
      return false;
    }
  }

  /**
   * Invoke protégé avec fallback intelligent
   */
  async safeInvoke<T>(command: string, args?: any, timeoutMs = 10000): Promise<T> {
    const cacheKey = `${command}:${JSON.stringify(args)}`;

    // Check cache first pour éviter appels répétés
    const cached = this.checkCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    try {
      // Import dynamique avec protection (détermine disponibilité réelle)
      const tauriModule = await this.safeTauriImport();
      if (!tauriModule || !tauriModule.invoke) {
        this.isTauriAvailable = false;
        if (this.isTestEnv) {
          throw new Error('Tauri invoke not available');
        }
        return this.createFallbackResponse<T>(command, 'Tauri invoke not available');
      }

      this.isTauriAvailable = true;

      // Appel avec timeout
      const result = await Promise.race([
        tauriModule.invoke<T>(command, args),
        this.createTimeoutPromise<T>(timeoutMs)
      ]);

      // Cache du résultat positif
      this.checkCache[cacheKey] = {
        result,
        timestamp: Date.now()
      };

      return result;

    } catch (error) {
      console.warn(`[TauriProtector] Command ${command} failed:`, error);
      if (this.isTestEnv) {
        // En mode test, propager l'erreur pour permettre les assertions
        throw error;
      }
      return this.createFallbackResponse<T>(command, error);
    }
  }

  /**
   * Import sécurisé du module Tauri
   */
  private async safeTauriImport(): Promise<{ invoke: typeof import('@tauri-apps/api/core').invoke } | null> {
    try {
      const module = await import('@tauri-apps/api/core');
      if (module && typeof module.invoke === 'function') {
        this.isTauriAvailable = true;
        return { invoke: module.invoke };
      }
      return null;
    } catch (error) {
      console.warn('[TauriProtector] Failed to import Tauri core:', error);
      this.isTauriAvailable = false;
      return null;
    }
  }

  /**
   * Créer une Promise avec timeout
   */
  private createTimeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
  }

  /**
   * Génère une réponse de fallback intelligente selon le type de commande
   */
  private createFallbackResponse<T>(command: string | undefined, error: any): T {
    const safeCommand = command || 'unknown_command';
    console.log(`[TauriProtector] Using fallback for ${safeCommand}`);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Fallbacks spécifiques par type de commande
    if (safeCommand.includes('singularity_get_full_state')) {
      return createFallbackSingularityState() as T;
    }

    if (safeCommand.includes('singularity_get_physical')) {
      return createFallbackPhysical() as T;
    }

    if (safeCommand.includes('singularity_get_cognitive')) {
      return createFallbackCognitive() as T;
    }

    if (safeCommand.includes('singularity_get_symbolic')) {
      return createFallbackSymbolic() as T;
    }

    if (safeCommand.includes('singularity_get_adaptive')) {
      return createFallbackAdaptive() as T;
    }

    if (safeCommand.includes('singularity_get_meta')) {
      return createFallbackMeta() as T;
    }

    if (safeCommand.includes('singularity_get_global_coherence')) {
      return 0.5 as T;
    }

    if (safeCommand.includes('singularity_is_critical')) {
      return false as T;
    }

    if (safeCommand.includes('chat_get_providers_status') || safeCommand.includes('providers')) {
      return {
        success: false,
        providers: [],
        error: errorMessage,
        fallback: true,
        message: 'Backend offline - using local AI fallback'
      } as T;
    }

    if (safeCommand.includes('chat_send_message') || safeCommand.includes('chat')) {
      return {
        success: false,
        error: errorMessage,
        fallback: true,
        provider: 'titane-local',
        message: {
          id: `fallback-${Date.now()}`,
          content: 'Backend unavailable. Please try again or use local mode.',
          role: 'assistant',
          timestamp: Date.now()
        }
      } as T;
    }

    if (command && (command.includes('status') || command.includes('health') || command.includes('state'))) {
      return {
        status: 'offline',
        available: false,
        error: errorMessage,
        fallback: true,
        health: 'degraded'
      } as T;
    }

    // Fallback générique
    return {
      success: false,
      error: errorMessage,
      fallback: true,
      timestamp: Date.now()
    } as T;
  }

  /**
   * Reset cache et état
   */
  reset(): void {
    this.isTauriAvailable = null;
    this.checkCache = {};
    console.log('[TauriProtector] Cache reset');
  }
}

// Instance globale
export const tauriProtector = TauriInvokeProtector.getInstance();

/**
 * Fonction utilitaire pour invoke protégé
 * Remplace directement les appels invokeTauri problématiques
 */
export async function safeInvokeTauri<T>(command: string, args?: any, timeoutMs?: number): Promise<T> {
  return tauriProtector.safeInvoke<T>(command, args, timeoutMs);
}

/**
 * Helper pour vérifier rapidement la disponibilité du runtime Tauri.
 */
export function isTauriRuntimeAvailable(): boolean {
  return tauriProtector.isAvailable();
}
