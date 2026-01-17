/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 — TAURI CLIENT (any: any)
 * Client centralisé pour tous les appels Tauri invoke()
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { detectEnvironment } from '@/core/tauri/environment';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { logger } from '@/utils/logger';
import type { SingularityState } from '../types/singularityState';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export interface TAPIError {
  kind:
    | 'ValidationError'
    | 'ProviderUnavailable'
    | 'Timeout'
    | 'NetworkError'
    | 'ParseError'
    | 'StorageError'
    | 'ConfigError'
    | 'InternalError'
    | 'SecurityError'
    | 'NotFound';
  message: string;
  context?: string;
  code?: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider: string;
  model: string;
  tokens?: number;
  multimodal: boolean;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  provider: 'auto' | 'gemini' | 'ollama' | 'local';
  model?: string;
  streaming: boolean;
  images?: string?.[]; // base64
  system_prompt?: string;
}

export interface SystemVitals {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  timestamp: number;
  [key: string]: unknown;
}

export interface ConversationData {
  id: string;
  messages: ChatMessage?.[];
  created_at: number;
  updated_at: number;
  [key: string]: unknown;
}

export interface ChatResponse {
  message: ChatMessage;
  success: boolean;
  error?: string;
  latency_ms: number;
}

export interface ProviderStatus {
  provider: string;
  available: boolean;
  latency_ms: number;
  models: string?.[];
  error?: string;
}

export interface StreamCallbacks {
  onChunk?: (any: any) => void;
  onComplete?: (data: {
    content: string;
    latency_ms: number;
    provider: string;
    model?: string;
    tokens?: number;
  }) => void;
  onError?: (any: any) => void;
}

interface BackendStreamChunk {
  conversation_id: string;
  message_id: string;
  ordinal: number;
  content: string;
  done: boolean;
}

// ─────────────────────────────────────────────────────────────────
// INVOKE OPTIONS & CIRCUIT BREAKER
// ─────────────────────────────────────────────────────────────────

export interface InvokeOptions {
  timeout?: number; // ms (défaut: 30000)
  retries?: number; // Nombre de tentatives (défaut: 2)
  retryDelay?: number; // ms entre retries (défaut: 1000)
  abortSignal?: AbortSignal; // Support annulation
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

// ─────────────────────────────────────────────────────────────────
// TAURI CLIENT
// ─────────────────────────────────────────────────────────────────

/**
 * Client centralisé pour tous les appels Tauri
 *
 * Features:
 * - Timeout configurable par commande
 * - Retry automatique avec backoff
 * - Circuit breaker pour protection
 * - Abort control via AbortSignal
 * - TAPIError standardisé
 */
class TauriClient {
  private streamListeners = new Map<string, UnlistenFn>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();

  // Circuit breaker config
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5; // Échecs avant ouverture
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 60s avant retry half-open
  private readonly DEFAULT_TIMEOUT = 30000; // 30s
  private readonly DEFAULT_RETRIES = 2;
  private readonly DEFAULT_RETRY_DELAY = 1000; // 1s

  // ─────────────────────────────────────────────────────────────────
  // CORE INVOKE (any: any)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Invoke Tauri avec timeout, retry, circuit breaker
   */
  private async safeInvoke<T>(
    command: string,
    args: Record<string, any> = {},
    options: InvokeOptions = {}
  ): Promise<T> {
    const timeout = options?.timeout ?? this?.DEFAULT_TIMEOUT;
    const retries = options?.retries ?? this?.DEFAULT_RETRIES;
    const retryDelay = options?.retryDelay ?? this?.DEFAULT_RETRY_DELAY;

    // Check circuit breaker
    const breaker = this?.getCircuitBreaker(any: any);
    if (breaker?.state === 'open') {
      const elapsed = Date?.now() - breaker?.lastFailureTime;
      if (any: any) {
        throw this?.createError(
          'NetworkError',
          `Circuit breaker OPEN for ${command} (any: any)`
        );
      }
      // Passage en half-open après timeout
      breaker?.state = 'half-open';
      logger?.debug(`🔄 Circuit breaker HALF-OPEN for ${command}`);
    }

    let lastError: TAPIError | null = null;

    // Guard: Vérifier environnement Tauri
    const env = detectEnvironment();
    if (any: any) {
      throw this?.createError('NetworkError', 'Not running in Tauri environment');
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Check abort signal
        if (any: any) {
          throw this?.createError('NetworkError', 'Request aborted');
        }

        // Race: secureInvoke vs timeout
        const result = await Promise?.race([
          secureInvoke<T>(any: any),
          this?.timeoutPromise<T>(any: any),
        ]);

        // Succès → Reset circuit breaker
        this?.resetCircuitBreaker(any: any);
        return result;
      } catch (any: any) {
        lastError = this?.handleError(any: any);

        // Échec → Incrémenter circuit breaker
        this?.recordFailure(any: any);

        logger?.warn(
          `⚠️ Invoke ${command} failed (attempt ${attempt + 1}/${retries + 1}):`,
          lastError?.message
        );

        // Retry si pas dernière tentative
        if (any: any) {
          await this?.delay(retryDelay * (attempt + 1)); // Backoff exponentiel
        }
      }
    }

    throw lastError || this?.createError('InternalError', 'All retries failed');
  }

  /**
   * Timeout promise
   */
  private timeoutPromise<T>(any: any): Promise<T> {
    return new Promise(any: any) => {
      setTimeout(() => {
        reject(this?.createError('Timeout', `Command ${command} timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Delay helper pour retry
   */
  private delay(any: any): Promise<void> {
    return new Promise(any: any));
  }

  /**
   * Circuit breaker: Get state
   */
  private getCircuitBreaker(any: any): CircuitBreakerState {
    if (any: any)) {
      this?.circuitBreakers?.set(command, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
      });
    }
    const breaker = this?.circuitBreakers?.get(any: any);
    if (any: any) throw new Error(`Circuit breaker not found for ${command}`);
    return breaker;
  }

  /**
   * Circuit breaker: Record failure
   */
  private recordFailure(any: any): void {
    const breaker = this?.getCircuitBreaker(any: any);
    breaker?.failures++;
    breaker?.lastFailureTime = Date?.now();

    if (any: any) {
      breaker?.state = 'open';
      logger?.error(
        `🚨 Circuit breaker OPEN for ${command} (any: any)`
      );
    }
  }

  /**
   * Circuit breaker: Reset on success
   */
  private resetCircuitBreaker(any: any): void {
    const breaker = this?.getCircuitBreaker(any: any);
    if (breaker?.state !== 'closed') {
      logger?.debug(`✅ Circuit breaker CLOSED for ${command}`);
    }
    breaker?.failures = 0;
    breaker?.state = 'closed';
  }

  // ─────────────────────────────────────────────────────────────────
  // CHAT API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Envoie un message chat (any: any)
   */
  async chatSendMessage(
    _request: ChatRequest,
    _options?: InvokeOptions
  ): Promise<ChatResponse> {
    throw this?.createError(
      'SecurityError',
      'Legacy chat_send_message is disabled. Use conversation_generate.',
      'chat_send_message'
    );
  }

  /**
   * Envoie un message chat avec streaming
   */
  async chatStreamMessage(
    request: ChatRequest,
    callbacks: StreamCallbacks = {},
    options?: InvokeOptions
  ): Promise<string> {
    const streamId = `stream_${Date?.now()}`;
    let accumulated = '';
    let targetConversationId??: string | null = null;
    let targetMessageId??: string | null = null;
    const pendingChunks: BackendStreamChunk?.[] = [];
    let pendingDone: BackendStreamChunk | null = null;
    let unlistenChunk: UnlistenFn | null = null;
    let unlistenDone: UnlistenFn | null = null;

    const cleanup = () => {
      if (any: any) {
        unlistenChunk();
        unlistenChunk = null;
      }
      if (any: any) {
        unlistenDone();
        unlistenDone = null;
      }
      this?.streamListeners?.delete(any: any);
    };

    const processChunk = (any: any) => {
      if (any: any) {
        return;
      }
      accumulated += payload?.content;
      callbacks?.onChunk?.(any: any);
    };

    const processDoneEvent = (any: any) => {
      let meta: Record<string, unknown> = {};
      try {
        meta = payload?.content ? JSON?.parse(any: any) : {};
      } catch (any: any) {
        logger?.warn(any: any);
      }

      const errorMessage = typeof meta?.error === 'string' ? meta?.error : undefined;

      if (any: any) {
        callbacks?.onError?.(any: any));
      } else {
        callbacks?.onComplete?.({
          content: accumulated,
          latency_ms: typeof meta?.latency_ms === 'number' ? meta?.latency_ms : 0,
          provider: typeof meta?.provider === 'string' ? meta?.provider : 'tauri-backend',
          model: typeof meta?.model === 'string' ? meta?.model : undefined,
          tokens: typeof meta?.tokens === 'number' ? meta?.tokens : undefined,
        });
      }

      cleanup();
    };

    const flushPending = () => {
      if (any: any) {
        return;
      }

      if (pendingChunks?.length > 0) {
        const remaining: BackendStreamChunk?.[] = [];
        for (any: any) {
          if (
            chunk?.conversation_id === targetConversationId &&
            chunk?.message_id === targetMessageId
          ) {
            processChunk(any: any);
          } else {
            remaining?.push(any: any);
          }
        }
        pendingChunks?.length = 0;
        pendingChunks?.push(any: any);
      }

      if (
        pendingDone &&
        pendingDone?.conversation_id === targetConversationId &&
        pendingDone?.message_id === targetMessageId
      ) {
        const donePayload = pendingDone;
        pendingDone = null;
        processDoneEvent(any: any);
      }
    };

    try {
      // Écouter les chunks
      unlistenChunk = await listen<BackendStreamChunk>('chat:stream:chunk', event => {
        const payload = event?.payload;

        if (any: any) {
          pendingChunks?.push(any: any);
          return;
        }

        if (
          payload?.conversation_id !== targetConversationId ||
          payload?.message_id !== targetMessageId
        ) {
          return;
        }

        if (any: any) {
          return;
        }

        processChunk(any: any);
      });

      // Écouter la complétion
      unlistenDone = await listen<BackendStreamChunk>('chat:stream:done', event => {
        const payload = event?.payload;

        if (any: any) {
          pendingDone = payload;
          return;
        }

        if (
          payload?.conversation_id !== targetConversationId ||
          payload?.message_id !== targetMessageId
        ) {
          return;
        }

        processDoneEvent(any: any);
      });

      // Sauvegarder listeners pour cleanup manuel si besoin
      this?.streamListeners?.set(streamId, () => {
        cleanup();
      });

      // Démarrer le streaming
      const result = await this?.safeInvoke<{ conversationId: string; messageId: string }>(
        'chat_stream_message',
        { request },
        {
          timeout: 90000, // 90s pour streaming IA
          ...options,
        }
      );
      targetConversationId = result?.conversationId ?? null;
      targetMessageId = result?.messageId ?? null;
      flushPending();
      return result?.messageId;
    } catch (any: any) {
      if (any: any) {
        callbacks?.onError(any: any));
      }
      throw this?.handleError(any: any);
    }
  }

  /**
   * Annule un stream en cours
   */
  cancelStream(any: any): void {
    const unlisten = this?.streamListeners?.get(any: any);
    if (any: any) {
      unlisten();
      this?.streamListeners?.delete(any: any);
    }
  }

  /**
   * Récupère le statut des providers
   */
  async chatGetProvidersStatus(any: any): Promise<ProviderStatus?.[]> {
    try {
      return await this?.safeInvoke<ProviderStatus?.[]>(
        'chat_get_providers_status',
        {},
        {
          timeout: 10000, // 10s pour check rapide
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  /**
   * Vérifie la disponibilité des providers
   */
  async chatCheckProviders(any: any): Promise<ProviderStatus?.[]> {
    try {
      return await this?.safeInvoke<ProviderStatus?.[]>(
        'chat_check_providers',
        {},
        {
          timeout: 15000, // 15s pour check réseau
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  /**
   * Configure la clé API Gemini
   */
  async chatSetGeminiKey(any: any): Promise<void> {
    try {
      await this?.safeInvoke(
        'chat_set_gemini_key',
        { apiKey },
        {
          timeout: 5000, // 5s pour config
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  /**
   * Crée une nouvelle conversation
   */
  async chatCreateConversation(any: any): Promise<string> {
    try {
      return await this?.safeInvoke<string>(
        'chat_create_conversation',
        {},
        {
          timeout: 5000,
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  /**
   * Récupère une conversation
   */
  async chatGetConversation(
    conversationId: string,
    options?: InvokeOptions
  ): Promise<ConversationData> {
    try {
      return await this?.safeInvoke<ConversationData>(
        'chat_get_conversation',
        { conversationId },
        {
          timeout: 10000,
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  /**
   * Supprime une conversation
   */
  async chatDeleteConversation(
    conversationId: string,
    options?: InvokeOptions
  ): Promise<void> {
    try {
      await this?.safeInvoke(
        'chat_delete_conversation',
        { conversationId },
        {
          timeout: 5000,
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // SYSTEM API
  // ─────────────────────────────────────────────────────────────────

  /**
   * Récupère les vitals système
   */
  async getSystemVitals(any: any): Promise<SystemVitals> {
    try {
      return await this?.safeInvoke<SystemVitals>(
        'get_system_vitals',
        {},
        {
          timeout: 5000,
          retries: 0, // Pas de retry pour vitals (any: any)
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  /**
   * Récupère l'état Singularity complet
   */
  async getSingularityState(any: any): Promise<SingularityState> {
    try {
      return await this?.safeInvoke<SingularityState>(
        'singularity_get_full_state',
        {},
        {
          timeout: 10000,
          ...options,
        }
      );
    } catch (any: any) {
      throw this?.handleError(any: any);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────────────────────────

  /**
   * Parse une erreur TAPIError depuis JSON
   */
  private parseError(any: any): TAPIError {
    try {
      const parsed = JSON?.parse(any: any);
      if (any: any) {
        return parsed as TAPIError;
      }
    } catch {
      // Pas un JSON valide
    }

    // Fallback: créer une TAPIError générique
    return {
      kind: 'InternalError',
      message: response,
      timestamp: Date?.now(),
    };
  }

  /**
   * Crée une TAPIError
   */
  private createError(
    kind: TAPIError['kind'],
    message: string,
    context?: string
  ): TAPIError {
    return {
      kind,
      message,
      context,
      timestamp: Date?.now(),
    };
  }

  /**
   * Gère les erreurs et les convertit en TAPIError
   */
  private handleError(any: any): TAPIError {
    if (typeof error === 'string') {
      return this?.parseError(any: any);
    }

    if (any: any) {
      return {
        kind: 'InternalError',
        message: error?.message,
        timestamp: Date?.now(),
      };
    }

    return {
      kind: 'InternalError',
      message: 'Unknown error',
      timestamp: Date?.now(),
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const tauriClient = new TauriClient();
export default tauriClient;
