/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🛡️ TAURI INVOKE PROTECTION PATCH
 * Correction des erreurs "Cannot read properties of undefined (reading 'invoke')"
 */

import { invoke } from '@tauri-apps/api/core';
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
import { createLogger } from '@/utils/logger';
import { getRemoteTransport } from '@/lib/remoteTransport';

const logger = createLogger('TauriProtector');

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

const TOTAL_DEV_BROWSER_SESSION_KEY = 'titane_total_dev_browser_session_expiry';

type TotalDevBrowserLockState = 'LOCKED' | 'UNLOCKED' | 'EXPIRED';

const getNowUnix = () => Math.floor(Date.now() / 1000);

const writeTotalDevBrowserExpiry = (expiry: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (expiry > 0) {
    window.sessionStorage.setItem(TOTAL_DEV_BROWSER_SESSION_KEY, String(expiry));
  } else {
    window.sessionStorage.removeItem(TOTAL_DEV_BROWSER_SESSION_KEY);
  }
};

const getTotalDevBrowserLockState = (): {
  lock_state: TotalDevBrowserLockState;
  expires_at_unix?: number;
  now_unix: number;
  fallback: true;
} => {
  const now = getNowUnix();

  // Browser fallback is intentionally never unlockable; clear any stale legacy session.
  writeTotalDevBrowserExpiry(0);

  return {
    lock_state: 'LOCKED',
    expires_at_unix: undefined,
    now_unix: now,
    fallback: true,
  };
};

const getTotalDevBrowserUnlockResult = (_args?: TauriCommandArgs) => {
  writeTotalDevBrowserExpiry(0);

  return {
    ok: false,
    expires_at_unix: undefined,
    lock_state: 'LOCKED',
    error: 'TOTAL_DEV requires the Tauri runtime',
    fallback: true,
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
    logger.info(
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
      // Strategy 1: window.__TAURI__ (primary)
      const hasTauriGlobal = window.__TAURI__ && typeof window.__TAURI__ === 'object';

      // Strategy 2: window.__TAURI_INTERNALS__ (secondary)
      const hasTauriInternals =
        window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__ === 'object';

      // Strategy 3: Check for actual invoke function in either location
      const tauriCore = window.__TAURI__?.core;
      const tauriInternals = window.__TAURI_INTERNALS__ as
        | Record<string, unknown>
        | undefined;
      const hasTauriInvoke =
        (tauriCore?.invoke && typeof tauriCore.invoke === 'function') ||
        (tauriInternals?.['invoke'] && typeof tauriInternals['invoke'] === 'function');

      // Strategy 4: Runtime flag (set during initialization)
      const hasTauriFlag = window.__TITANE_TAURI_INITIALIZED === true;

      // ✅ If ANY strategy confirms Tauri, mark as available
      const isAvailable =
        hasTauriGlobal || hasTauriInternals || hasTauriInvoke || hasTauriFlag;

      if (isAvailable) {
        this.isTauriAvailable = true;
        logger.info(
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
      logger.warn('[TauriProtector] Error checking Tauri availability:', error);
      this.isTauriAvailable = false;
      return false;
    }
  }

  /**
   * Invoke protégé avec fallback intelligent
   * ✅ v∞: Anti-debounce pour start_recording et autres commandes critiques
   */
  async safeInvoke<T>(
    command: string,
    args?: TauriCommandArgs,
    _timeoutMs?: number
  ): Promise<T> {
    const cacheKey = `${command}:${JSON.stringify(args)}`;
    const shouldUseResultCache = this.shouldUseResultCache(command);

    // ✅ ANTI-DEBOUNCE: For recording commands, prevent duplicate calls
    if (command === 'start_recording' || command === 'stop_recording') {
      const pending = this.pendingInvokes.get(command);
      if (pending) {
        logger.warn(
          `[TauriProtector] ${command} already in progress, returning existing promise`
        );
        return pending as Promise<T>;
      }
    }

    // Check cache first pour éviter appels répétés (skip for recording commands)
    if (shouldUseResultCache) {
      const cached = this.checkCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.result as T;
      }
    }

    try {
      // Create the invoke promise
      const invokePromise = this.performInvoke<T>(command, args, cacheKey);

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

      logger.warn(`[TauriProtector] Command ${command} failed:`, normalizedError);

      if (this.isTestEnv) {
        // En mode test, propager l'erreur pour permettre les assertions
        throw normalizedError;
      }
      return this.createFallbackResponse<T>(command, normalizedError, args);
    }
  }

  /**
   * Perform the actual invoke (separated for anti-debounce)
   */
  private async performInvoke<T>(
    command: string,
    args: TauriCommandArgs,
    cacheKey: string
  ): Promise<T> {
    // ✅ v20.2: Don't re-check Tauri here - use cache state instead
    // If isTauriAvailable is FALSE (confirmed unavailable), skip invoke
    // If isTauriAvailable is NULL or TRUE (not yet checked, or confirmed available), proceed
    if (this.isTauriAvailable === false && !this.isTestEnv) {
      // ✅ REMOTE-GATEWAY FIX: In remote browser mode, route through HTTP gateway
      // instead of local fallback. window.__TITANE_REMOTE__ is injected by axum SPA server.
      const isRemoteBrowser =
        typeof window !== 'undefined' &&
        (window as Window & { __TITANE_REMOTE__?: boolean }).__TITANE_REMOTE__ === true;
      if (isRemoteBrowser) {
        logger.info(
          '[TauriProtector] Remote context detected — routing via HTTP gateway',
          command
        );
        // Tauri v2 wraps payloads as { args: inner } for the command macro,
        // but the remote gateway expects the inner payload directly.
        const remoteArgs: Record<string, unknown> =
          args && typeof args === 'object' && 'args' in (args as object)
            ? (((args as Record<string, unknown>).args as Record<string, unknown>) ?? {})
            : ((args as Record<string, unknown>) ?? {});
        return getRemoteTransport().invoke<T>(command, remoteArgs);
      }
      logger.info(
        '[TauriProtector] Skipping invoke for',
        command,
        '- Tauri marked as unavailable'
      );
      return this.createFallbackResponse<T>(
        command,
        'Tauri not available (cached)',
        args
      );
    }

    // ✅ CRITICAL FIX v20.3: Use cached module if available, don't re-import
    // This prevents timing-dependent failures
    let tauriModule = this.tauriModuleCache;

    if (!tauriModule) {
      logger.info('[TauriProtector] 🔄 Module cache miss - importing...');
      // Only import if not cached
      tauriModule = await this.safeTauriImport();
      if (!tauriModule || !tauriModule.invoke) {
        logger.warn('[TauriProtector] ❌ Module import/invoke failed for', command);
        this.isTauriAvailable = false;
        if (this.isTestEnv) {
          throw new Error('Tauri invoke not available');
        }
        return this.createFallbackResponse<T>(
          command,
          'Tauri invoke not available',
          args
        );
      }
      // Cache the module for future calls
      this.tauriModuleCache = tauriModule;
      logger.info('[TauriProtector] ✅ Module cached successfully');
    }

    this.isTauriAvailable = true;

    try {
      logger.info(`[TauriProtector] 🚀 Invoking: ${command} with args:`, args);

      // Appel direct - handle undefined args
      const invokeCall =
        args !== undefined && args !== null
          ? tauriModule.invoke<T>(command, args)
          : tauriModule.invoke<T>(command);

      const result = await invokeCall;

      logger.info(`[TauriProtector] ✅ Invoke succeeded: ${command}`);

      // Cache du résultat positif (skip for recording commands)
      if (this.shouldUseResultCache(command)) {
        this.checkCache[cacheKey] = {
          result,
          timestamp: Date.now(),
        };
      }

      return result;
    } catch (invokeError) {
      logger.warn(
        `[TauriProtector] ❌ Invoke failed: ${command}`,
        invokeError instanceof Error ? invokeError.message : String(invokeError)
      );
      throw invokeError; // Re-throw to be caught by safeInvoke
    }
  }

  /**
   * Import sécurisé du module Tauri
   * ✅ v20.3: Cache le module importé pour éviter re-imports
   * ✅ v38.0.0: Use static import at top-level for Rolldown optimization
   */
  private async safeTauriImport(): Promise<{
    invoke: typeof invoke;
  } | null> {
    try {
      // ✅ If we've already imported and cached, return immediately
      if (this.tauriModuleCache) {
        logger.info('[TauriProtector] ✅ Using cached Tauri module');
        return this.tauriModuleCache;
      }

      // ✅ If we've already confirmed Tauri is unavailable, don't try again
      if (this.isTauriAvailable === false && !this.isTestEnv) {
        return null;
      }

      if (typeof invoke === 'function') {
        // Verify invoke is actually bound to the Tauri runtime
        // In browser mode, invoke exists but may not be callable
        try {
          // Quick sanity check: invoke should have a name
          if (
            invoke.name &&
            (invoke.name === 'invoke' || invoke.toString().includes('tauri'))
          ) {
            this.isTauriAvailable = true;
            this.tauriModuleCache = { invoke };
            logger.info(
              '[TauriProtector] ✅ Successfully imported Tauri core module (verified)'
            );
            return { invoke };
          } else {
            logger.warn(
              '[TauriProtector] Tauri invoke imported but signature suspicious:',
              invoke.name
            );
            // Still cache it in case it's the real thing
            this.isTauriAvailable = true;
            this.tauriModuleCache = { invoke };
            return { invoke };
          }
        } catch (e) {
          // If we can even check the invoke function, that's a problem
          logger.warn('[TauriProtector] Error verifying invoke function:', e);
          this.isTauriAvailable = false;
          return null;
        }
      }

      logger.warn('[TauriProtector] Tauri module imported but invoke not found');
      this.isTauriAvailable = false;
      return null;
    } catch (error) {
      logger.warn('[TauriProtector] Failed to import Tauri core:', error);
      this.isTauriAvailable = false;
      return null;
    }
  }

  /**
   * Génère une réponse de fallback intelligente selon le type de commande
   */
  private createFallbackResponse<T>(
    command: string | undefined,
    error: unknown,
    args?: TauriCommandArgs
  ): T {
    const safeCommand = command || 'unknown_command';
    if (safeCommand.includes('conversation_generate')) {
      logger.info('[TauriProtector] Fallback engaged for conversation_generate');
    } else {
      logger.info(`[TauriProtector] Using fallback for ${safeCommand}`);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (safeCommand === 'total_dev_session_status') {
      return getTotalDevBrowserLockState() as T;
    }

    if (safeCommand === 'total_dev_unlock') {
      return getTotalDevBrowserUnlockResult(args) as T;
    }

    if (safeCommand === 'total_dev_revoke') {
      writeTotalDevBrowserExpiry(0);
      return true as T;
    }

    if (
      safeCommand === 'update_singularity_state' ||
      safeCommand.startsWith('singularity_update_')
    ) {
      return {
        ok: true,
        content: {
          command: safeCommand,
          fallback: true,
          timestamp: Date.now(),
        },
        error: null,
      } as T;
    }

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

    if (safeCommand === 'create_new_conversation') {
      return `fallback-${Date.now()}` as T;
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
        logger.warn('[TauriProtector] conversation_generate IPC error', {
          traceId,
          code: ipcCode,
          error: errorMessage,
        });

        return {
          content: `${ipcCode}: ${classification.message}`,
          conversationId: `fallback-${Date.now()}`,
          messageId: `fallback-${Date.now()}`,
          latencyMs: 0,
          meta: {
            provider_used: 'fallback',
            provider_class: 'local',
            mode: 'ERROR',
            reason_code: 'CONTRACT_VIOLATION_CLAMPED',
            latency_ms_total: 0,
            timeout_ms: 0,
            retries: 0,
            attempts: [],
            network_used: false,
            cache_hit: false,
            policy: 'tauri_protector_ipc_fallback',
          },
          decision: {
            online: false,
            reasonCode: 'OFFLINE_INTERNAL_ERROR',
            providerSelected: 'fallback',
            attempts: [],
            networkUsed: false,
            mode: 'ERROR',
          },
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

      logger.warn('[TauriProtector] conversation_generate fallback', {
        traceId,
        classification: classification.type,
        error: errorMessage,
      });

      return {
        content: message,
        conversationId: `fallback-${Date.now()}`,
        messageId: `fallback-${Date.now()}`,
        latencyMs: 0,
        meta: {
          provider_used: 'fallback',
          provider_class: 'local',
          mode: classification.type === 'timeout' ? 'OFFLINE' : 'ERROR',
          reason_code: classification.type === 'timeout' ? 'TIMEOUT' : 'FALLBACK_OFFLINE',
          latency_ms_total: 0,
          timeout_ms: 0,
          retries: 0,
          attempts: [],
          network_used: false,
          cache_hit: false,
          policy: 'tauri_protector_runtime_fallback',
        },
        decision: {
          online: false,
          reasonCode:
            classification.type === 'timeout'
              ? 'OFFLINE_TIMEOUT'
              : classification.type === 'network'
                ? 'OFFLINE_NETWORK_BLOCKED'
                : 'OFFLINE_INTERNAL_ERROR',
          providerSelected: 'fallback',
          attempts: [],
          networkUsed: false,
          mode: classification.type === 'timeout' ? 'OFFLINE' : 'ERROR',
        },
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

    // [RETRAIT v27.0.5-prod] Fallback legacy chat command removed from protector

    // ✅ FIX-WEB-RESEARCH v31.2.29: Return valid ResearchReport when Tauri unavailable
    // Prevents crash in classifyResearchOutcome where report.trace was undefined
    if (safeCommand === 'web_research') {
      const traceId = `fallback-${Date.now()}`;
      return {
        answer: {
          answer:
            "\u26a0\ufe0f Recherche web non disponible en mode navigateur. Lance l'application TITANE native pour acc\u00e9der \u00e0 la recherche web compl\u00e8te.",
          citations: [],
          confidence: 0,
          limitations: [
            'Tauri runtime non disponible',
            'Mode navigateur sans backend natif',
            "Fonctionnalit\u00e9 r\u00e9serv\u00e9e \u00e0 l'application TITANE install\u00e9e",
          ],
          trace_id: traceId,
          sources_count: 0,
          retrieved_passages_count: 0,
        },
        trace: {
          trace_id: traceId,
          markers: ['FALLBACK_BROWSER', 'NO_CONTENT'],
          timings: null,
          budgets: null,
          network_events: null,
          cache_events: null,
          robots_events: null,
          rate_limit_events: null,
          extract_events: null,
          index_events: null,
          errors: [`Tauri unavailable: ${errorMessage}`],
        },
      } as T;
    }

    // ✅ FIX-WEB-SEARCH v31.2.29: Return valid {ok,content,error} envelope for web_search fallback
    if (safeCommand === 'web_search') {
      return {
        ok: false,
        content: null,
        error: {
          code: 'TAURI_UNAVAILABLE',
          message: 'Recherche web non disponible en mode navigateur (Tauri requis).',
        },
      } as T;
    }

    // ✅ FIX-ADMIN-HEALTH-CSV: Return canonical {ok:false} envelope so the
    // useProductionHealthTelemetry hook's envelope check fires correctly and
    // classifies the error as SOURCE_UNAVAILABLE instead of PARSER_ERROR.
    if (safeCommand === 'read_production_week1_csv') {
      return {
        ok: false,
        content: null,
        error: {
          message: errorMessage.startsWith('SOURCE_')
            ? errorMessage
            : `SOURCE_UNAVAILABLE: Tauri runtime non disponible — ${errorMessage}`,
        },
        fallback: true,
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
    logger.info('[TauriProtector] Cache reset');
  }

  private shouldUseResultCache(command: string): boolean {
    if (
      command === 'start_recording' ||
      command === 'stop_recording' ||
      command === 'cancel_recording'
    ) {
      return false;
    }

    // Memory persistence reads must reflect writes immediately.
    if (command.startsWith('persistent_memory_')) {
      return false;
    }

    return true;
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
