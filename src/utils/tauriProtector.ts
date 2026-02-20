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
import type { TauriCore, TauriCommandArgs, TauriCacheEntry } from '@/types/tauri';
import { classifyError } from '@/lib/errorClassification';

type TauriCoreBridge = {
  core?: TauriCore;
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
      mood: 'neutre', // ✨ v21.5.5 - MoodType French values
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
  private checkCache: Record<string, TauriCacheEntry> = {};
  private pendingInvokes: Map<string, Promise<any>> = new Map(); // ✅ Anti-debounce
  private tauriModuleCache: {
    invoke: typeof import('@tauri-apps/api/core').invoke;
  } | null = null; // ✅ CRITICAL FIX: Cache the imported module
  private readonly CACHE_DURATION = 5000; // 5s cache
  private readonly isTestEnv: boolean =
    (typeof process !== 'undefined' && Boolean(process.env?.VITEST_WORKER_ID)) ||
    (typeof globalThis !== 'undefined' &&
      Boolean((globalThis as { __vitest_worker__?: unknown }).__vitest_worker__));

  /**
   * Constructor - Initialize Tauri detection on first instantiation
   */
  constructor() {
    // ✅ v20.2: Initialize Tauri availability check immediately
    // This ensures isTauriAvailable is set as soon as the protector is created
    this.syncCheckTauriAvailability();
    console.log(
      '[TauriProtector] 🛡️ Initialized - isTauriAvailable:',
      this.isTauriAvailable
    );
  }

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
   * ✅ v20.1: Détection améliorée + cache persistant
   */
  private syncCheckTauriAvailability(): boolean {
    if (this.isTauriAvailable === true) {
      return true;
    }

    // Évite re-vérifier si déjà confirmé comme indisponible (dans cette session)
    if (this.isTauriAvailable === false) {
      return false;
    }

    try {
      if (typeof window === 'undefined') {
        this.isTauriAvailable = false;
        return false;
      }

      // 🔍 Multiple detection strategies (most permissive)
      const w = window as any;

      // Strategy 1: window.__TAURI__ (primary)
      const hasTauriGlobal = w.__TAURI__ && typeof w.__TAURI__ === 'object';

      // Strategy 2: window.__TAURI_INTERNALS__ (secondary)
      const hasTauriInternals =
        w.__TAURI_INTERNALS__ && typeof w.__TAURI_INTERNALS__ === 'object';

      // Strategy 3: Check for actual invoke function in either location
      const hasTauriInvoke =
        (w.__TAURI__?.core?.invoke && typeof w.__TAURI__.core.invoke === 'function') ||
        (w.__TAURI_INTERNALS__?.invoke &&
          typeof w.__TAURI_INTERNALS__.invoke === 'function');

      // Strategy 4: Runtime flag (set during initialization)
      const hasTauriFlag = w.__TITANE_TAURI_INITIALIZED === true;

      // ✅ If ANY strategy confirms Tauri, mark as available
      const isAvailable =
        hasTauriGlobal || hasTauriInternals || hasTauriInvoke || hasTauriFlag;

      if (isAvailable) {
        this.isTauriAvailable = true;
        console.log(
          '[TauriProtector] ✅ Tauri confirmed available (strategies:',
          {
            hasTauriGlobal,
            hasTauriInternals,
            hasTauriInvoke,
            hasTauriFlag,
          },
          ')'
        );
        return true;
      }

      this.isTauriAvailable = false;
      return false;
    } catch (error) {
      console.warn('[TauriProtector] Error checking Tauri availability:', error);
      this.isTauriAvailable = false;
      return false;
    }
  }

  /**
   * Invoke protégé avec fallback intelligent
   * ✅ v∞: Anti-debounce pour start_recording et autres commandes critiques
   * ✨ v27+ FIX: Default timeout 10s → 60s pour IA requests complexes
   */
  async safeInvoke<T>(
    command: string,
    args?: TauriCommandArgs,
    timeoutMs = 60000
  ): Promise<T> {
    const cacheKey = `${command}:${JSON.stringify(args)}`;

    // ✅ ANTI-DEBOUNCE: For recording commands, prevent duplicate calls
    if (command === 'start_recording' || command === 'stop_recording') {
      const pending = this.pendingInvokes.get(command);
      if (pending) {
        console.warn(
          `[TauriProtector] ${command} already in progress, returning existing promise`
        );
        return pending as Promise<T>;
      }
    }

    // Check cache first pour éviter appels répétés (skip for recording commands)
    if (
      command !== 'start_recording' &&
      command !== 'stop_recording' &&
      command !== 'cancel_recording'
    ) {
      const cached = this.checkCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.result as T;
      }
    }

    try {
      // Create the invoke promise
      const invokePromise = this.performInvoke<T>(command, args, timeoutMs, cacheKey);

      // Track for anti-debounce
      if (command === 'start_recording' || command === 'stop_recording') {
        this.pendingInvokes.set(command, invokePromise);
        invokePromise.finally(() => {
          this.pendingInvokes.delete(command);
        });
      }

      return await invokePromise;
    } catch (error) {
      // Cleanup pending invokes on error
      if (command === 'start_recording' || command === 'stop_recording') {
        this.pendingInvokes.delete(command);
      }

      const normalizedError = this.normalizeInvokeError(command, error);

      console.warn(`[TauriProtector] Command ${command} failed:`, normalizedError);

      if (this.isTestEnv) {
        // En mode test, propager l'erreur pour permettre les assertions
        throw normalizedError;
      }
      return this.createFallbackResponse<T>(command, normalizedError);
    }
  }

  /**
   * Perform the actual invoke (separated for anti-debounce)
   */
  private async performInvoke<T>(
    command: string,
    args: TauriCommandArgs,
    timeoutMs: number,
    cacheKey: string
  ): Promise<T> {
    // ✅ v20.2: Don't re-check Tauri here - use cache state instead
    // If isTauriAvailable is FALSE (confirmed unavailable), skip invoke
    // If isTauriAvailable is NULL or TRUE (not yet checked, or confirmed available), proceed
    if (this.isTauriAvailable === false && !this.isTestEnv) {
      console.log(
        '[TauriProtector] Skipping invoke for',
        command,
        '- Tauri marked as unavailable'
      );
      return this.createFallbackResponse<T>(command, 'Tauri not available (cached)');
    }

    // ✅ CRITICAL FIX v20.3: Use cached module if available, don't re-import
    // This prevents timing-dependent failures
    let tauriModule = this.tauriModuleCache;

    if (!tauriModule) {
      console.log('[TauriProtector] 🔄 Module cache miss - importing...');
      // Only import if not cached
      tauriModule = await this.safeTauriImport();
      if (!tauriModule || !tauriModule.invoke) {
        console.warn('[TauriProtector] ❌ Module import/invoke failed for', command);
        this.isTauriAvailable = false;
        if (this.isTestEnv) {
          throw new Error('Tauri invoke not available');
        }
        return this.createFallbackResponse<T>(command, 'Tauri invoke not available');
      }
      // Cache the module for future calls
      this.tauriModuleCache = tauriModule;
      console.log('[TauriProtector] ✅ Module cached successfully');
    }

    this.isTauriAvailable = true;

    try {
      console.log(`[TauriProtector] 🚀 Invoking: ${command} with args:`, args);

      // Appel avec timeout - handle undefined args
      const invokeCall =
        args !== undefined && args !== null
          ? tauriModule.invoke<T>(command, args)
          : tauriModule.invoke<T>(command);

      const result = await Promise.race([
        invokeCall,
        this.createTimeoutPromise<T>(timeoutMs),
      ]);

      console.log(`[TauriProtector] ✅ Invoke succeeded: ${command}`);

      // Cache du résultat positif (skip for recording commands)
      if (
        command !== 'start_recording' &&
        command !== 'stop_recording' &&
        command !== 'cancel_recording'
      ) {
        this.checkCache[cacheKey] = {
          result,
          timestamp: Date.now(),
        };
      }

      return result;
    } catch (invokeError) {
      console.warn(
        `[TauriProtector] ❌ Invoke failed: ${command}`,
        invokeError instanceof Error ? invokeError.message : String(invokeError)
      );
      throw invokeError; // Re-throw to be caught by safeInvoke
    }
  }

  /**
   * Import sécurisé du module Tauri
   * ✅ v20.3: Cache le module importé pour éviter re-imports
   */
  private async safeTauriImport(): Promise<{
    invoke: typeof import('@tauri-apps/api/core').invoke;
  } | null> {
    try {
      // ✅ If we've already imported and cached, return immediately
      if (this.tauriModuleCache) {
        console.log('[TauriProtector] ✅ Using cached Tauri module');
        return this.tauriModuleCache;
      }

      // ✅ If we've already confirmed Tauri is unavailable, don't try again
      if (this.isTauriAvailable === false && !this.isTestEnv) {
        return null;
      }

      const module = await import('@tauri-apps/api/core');
      if (module && typeof module.invoke === 'function') {
        // Verify invoke is actually bound to the Tauri runtime
        // In browser mode, invoke exists but may not be callable
        try {
          // Quick sanity check: invoke should have a name
          if (
            module.invoke.name &&
            (module.invoke.name === 'invoke' ||
              module.invoke.toString().includes('tauri'))
          ) {
            this.isTauriAvailable = true;
            this.tauriModuleCache = { invoke: module.invoke };
            console.log(
              '[TauriProtector] ✅ Successfully imported Tauri core module (verified)'
            );
            return { invoke: module.invoke };
          } else {
            console.warn(
              '[TauriProtector] Tauri invoke imported but signature suspicious:',
              module.invoke.name
            );
            // Still cache it in case it's the real thing
            this.isTauriAvailable = true;
            this.tauriModuleCache = { invoke: module.invoke };
            return { invoke: module.invoke };
          }
        } catch (e) {
          // If we can even check the invoke function, that's a problem
          console.warn('[TauriProtector] Error verifying invoke function:', e);
          this.isTauriAvailable = false;
          return null;
        }
      }

      console.warn('[TauriProtector] Tauri module imported but invoke not found');
      this.isTauriAvailable = false;
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
  private createFallbackResponse<T>(command: string | undefined, error: unknown): T {
    const safeCommand = command || 'unknown_command';
    if (safeCommand.includes('conversation_generate')) {
      console.log('[TauriProtector] Fallback engaged for conversation_generate');
    } else {
      console.log(`[TauriProtector] Using fallback for ${safeCommand}`);
    }

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

    if (
      safeCommand.includes('chat_get_providers_status') ||
      safeCommand.includes('providers')
    ) {
      return {
        success: false,
        providers: [],
        error: errorMessage,
        fallback: true,
        message: 'Backend offline - using local AI fallback',
      } as T;
    }

    if (safeCommand.includes('conversation_generate')) {
      // ✅ IPC FIX (Ω∞.v1): Classify error before showing fallback message
      const classification = classifyError(errorMessage);
      const traceId = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const normalizedMessage = errorMessage.toLowerCase();
      let ipcCode: 'IPC_INVALID_ARGS' | 'IPC_FORBIDDEN' | 'IPC_CONTRACT_MISMATCH' | null =
        null;

      if (
        normalizedMessage.includes('security:') &&
        (normalizedMessage.includes('not allowed') ||
          normalizedMessage.includes('whitelist'))
      ) {
        ipcCode = 'IPC_FORBIDDEN';
      } else if (
        normalizedMessage.includes('missing required') ||
        normalizedMessage.includes('invalid field') ||
        normalizedMessage.includes('snake_case') ||
        normalizedMessage.includes('payload')
      ) {
        ipcCode = 'IPC_INVALID_ARGS';
      } else if (classification.type === 'ipc') {
        ipcCode = 'IPC_CONTRACT_MISMATCH';
      }

      if (ipcCode) {
        console.warn('[TauriProtector] conversation_generate IPC error', {
          traceId,
          code: ipcCode,
          error: errorMessage,
        });

        return {
          content: `${ipcCode}: ${classification.message}`,
          conversationId: `fallback-${Date.now()}`,
          messageId: `fallback-${Date.now()}`,
          latencyMs: 0,
          metadata: {
            fallback: true,
            error: errorMessage,
            source: 'tauri-protector',
            traceId,
            errorCode: ipcCode,
            errorMessage: classification.message,
          },
        } as T;
      }

      const message =
        classification.type === 'ollama'
          ? 'Ollama indisponible. TITANE bascule en mode local.'
          : classification.type === 'timeout'
            ? "Délai d'attente dépassé. Réessaie."
            : classification.type === 'abort'
              ? 'Opération annulée.'
              : classification.type === 'network'
                ? 'Erreur réseau. Vérifie la connexion.'
                : classification.message;

      console.warn('[TauriProtector] conversation_generate fallback', {
        traceId,
        classification: classification.type,
        error: errorMessage,
      });

      return {
        content: message,
        conversationId: `fallback-${Date.now()}`,
        messageId: `fallback-${Date.now()}`,
        latencyMs: 0,
        metadata: {
          fallback: true,
          error: errorMessage,
          source: 'tauri-protector',
          traceId,
          errorCode: classification.type,
          errorMessage: classification.message,
        },
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
          timestamp: Date.now(),
        },
      } as T;
    }

    if (
      command &&
      (command.includes('status') ||
        command.includes('health') ||
        command.includes('state'))
    ) {
      return {
        status: 'offline',
        available: false,
        error: errorMessage,
        fallback: true,
        health: 'degraded',
      } as T;
    }

    // Fallback générique
    return {
      success: false,
      error: errorMessage,
      fallback: true,
      timestamp: Date.now(),
    } as T;
  }

  private normalizeInvokeError(command: string, error: unknown): Error {
    const err = error instanceof Error ? error : new Error(String(error));
    const isAbort =
      err.name === 'AbortError' ||
      /aborted/i.test(err.message) ||
      /abort/i.test(err.name);

    if (!isAbort) {
      return err;
    }

    const normalized = new Error('Invoke aborted');
    const isOllamaCommand =
      command.includes('ollama') || command === 'conversation_generate';
    normalized.name = isOllamaCommand ? 'OLLAMA_ABORTED' : 'TAURI_ABORTED';
    return normalized;
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
export async function safeInvokeTauri<T>(
  command: string,
  args?: TauriCommandArgs,
  timeoutMs?: number
): Promise<T> {
  return tauriProtector.safeInvoke<T>(command, args, timeoutMs);
}

/**
 * Helper pour vérifier rapidement la disponibilité du runtime Tauri.
 */
export function isTauriRuntimeAvailable(): boolean {
  return tauriProtector.isAvailable();
}
