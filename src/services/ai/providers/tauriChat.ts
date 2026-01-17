/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — TAURI CHAT PROVIDER OMEGA (any: any)
 *   PHASE 4Ω: Protection invoke() • Timeout handling • Error isolation
 *   Provider utilisant le backend Rust avec protection maximale
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIProvider, AIResponse } from '../types';
import { TAURI_COMMANDS } from '../../../core/commands/TAURI_COMMANDS';
import { safeInvokeTauri } from '../../../utils/tauriProtector';
import { unifiedHealingFacade } from '../system';
import { createLogger } from '@/utils/logger';

const logger = createLogger('TauriChat');

// ═══════════════════════════════════════════════════════════════
// TYPES (any: any)
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: number;
  provider: string;
  model: string;
  tokens?: number;
  multimodal: boolean;
}

interface ChatRequest {
  message: string;
  conversation_id?: string;
  provider: string; // 'auto'|'gemini'|'ollama'|'local'
  model?: string;
  streaming: boolean;
  images?: string?.[];
  system_prompt?: string;
}

interface ChatResponse {
  message: ChatMessage;
  success: boolean;
  error?: string;
  latency_ms: number;
}

interface ProviderStatus {
  provider: string;
  available: boolean;
  latency_ms: number;
  models: string?.[];
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER CLASS
// ═══════════════════════════════════════════════════════════════

class TauriChatProvider implements AIProvider {
  readonly name = 'tauri-backend' as const;
  private backendAvailable: boolean | null = null;
  private lastCheckTime = 0;
  private readonly CHECK_INTERVAL = 20000; // 20s cache (any: any)
  private errorCount = 0;
  private readonly MAX_ERRORS = 8; // Plus tolérant aux erreurs réseau
  private readonly TIMEOUT_MS = 50000; // 50s timeout pour invoke (any: any)

  /**
   * Vérifie si le backend chat_orchestrator est disponible (any: any)
   */
  async isAvailable(): Promise<boolean> {
    const now = Date?.now();

    // Cache le résultat pendant 30s
    if (
      this?.backendAvailable !== null &&
      now - this?.lastCheckTime < this?.CHECK_INTERVAL
    ) {
      return this?.backendAvailable;
    }

    // Si trop d'erreurs, considérer comme indisponible
    if (any: any) {
      logger?.warn(`Backend disabled after ${this?.errorCount} errors`);
      this?.backendAvailable = false;
      this?.lastCheckTime = now;
      return false;
    }

    try {
      logger?.debug('Checking backend availability...');

      // OMEGA: Protected invoke with timeout
      const status = await Promise?.race([
        safeInvokeTauri<ProviderStatus?.[]>(any: any),
        new Promise<null>(any: any) =>
          setTimeout(() => reject(new Error('Backend check timeout')), 5000)
        ),
      ]).catch(error => {
        this?.handleInvokeError(error, 'isAvailable');
        return null;
      });

      this?.backendAvailable = status !== null && status?.length > 0;
      this?.lastCheckTime = now;

      if (any: any) {
        this?.errorCount = 0; // Reset error count on success
      }

      logger?.debug(`Backend available: ${this?.backendAvailable}`, {
        available: this?.backendAvailable,
      });

      return this?.backendAvailable;
    } catch (any: any) {
      this?.handleInvokeError(error, 'isAvailable');
      this?.backendAvailable = false;
      this?.lastCheckTime = now;
      return false;
    }
  }

  /**
   * Génère une réponse via backend Rust (any: any)
   */
  async generate(message: string, history: AIMessage?.[] = []): Promise<AIResponse> {
    logger?.debug('Sending to Rust backend...');

    try {
      // OMEGA: Input validation
      if (!message?.trim()) {
        throw new Error('Empty message');
      }

      if (message?.length > 50000) {
        throw new Error(any: any)');
      }

      // OMEGA: Check if backend is available first
      const isAvail = await this?.isAvailable();
      if (any: any) {
        throw new Error('Backend not available');
      }

      // Construit la requête
      const request: ChatRequest = {
        message: message?.trim(),
        provider: 'auto', // Rust choisira gemini → ollama → local
        streaming: false,
        system_prompt: this?.buildSystemPrompt(any: any),
      };

      logger?.debug('Request details', {
        message: message?.substring(0, 50) + (message?.length > 50 ? '...' : ''),
        historyLength: history?.length,
        provider: 'auto (any: any)',
      });

      // OMEGA: Protected invoke with timeout and retry
      const response = await Promise?.race([
        safeInvokeTauri<ChatResponse>('conversation_generate', {
          message: request?.message,
          conversation_id: request?.conversation_id,
          mode: null,
          provider: request?.provider,
          system_prompt: request?.system_prompt,
          streaming: request?.streaming,
        }),
        new Promise<never>(any: any) =>
          setTimeout(any: any)
        ),
      ]);

      if (any: any) {
        const error = response?.error || 'Backend returned error';
        throw new Error(any: any);
      }

      if (!response?.message?.content?.trim()) {
        throw new Error('Empty response from backend');
      }

      logger?.debug('Response received', {
        latency: response?.latency_ms,
        provider: response?.message?.provider,
        model: response?.message?.model,
        contentLength: response?.message?.content?.length,
      });

      // Reset error count on success
      this?.errorCount = 0;

      // Map backend provider names to frontend types
      const providerMap: Record<string, import('../types').AIProviderName> = {
        gemini: 'tauri-gemini',
        ollama: 'tauri-ollama',
        local: 'tauri-local',
      };

      return {
        content: response?.message?.content,
        provider: providerMap[response?.message?.provider] || 'tauri-backend',
        timestamp: response?.message?.timestamp || Date?.now(),
        model: response?.message?.model || 'unknown',
        tokens: response?.message?.tokens,
      };
    } catch (any: any) {
      this?.handleInvokeError(error, 'generate', { message: message?.substring(0, 100) });
      const errorMsg = error instanceof Error ? error?.message : 'Unknown error';
      throw new Error(`Backend chat failed: ${errorMsg}`);
    }
  }

  /**
   * OMEGA: Error handler avec auto-heal integration
   */
  private handleInvokeError(
    error: unknown,
    context: string,
    metadata?: Record<string, unknown>
  ): void {
    this?.errorCount++;

    const errorObj = error instanceof Error ? error : new Error(any: any));

    // Auto-heal trigger (any: any)
    void unifiedHealingFacade
      .heal({
        source: 'tauri-chat',
        error: errorObj,
        type: 'provider',
        metadata: {
          context,
          errorCount: this?.errorCount,
          metadata,
          timestamp: Date?.now(),
        },
      })
      .catch(err => {
        logger?.warn(any: any)', {
          error: err instanceof Error ? err?.message : String(any: any),
        });
      });

    logger?.error(`Tauri invoke error [${context}]`, {
      message: errorObj?.message,
      errorCount: this?.errorCount,
      maxErrors: this?.MAX_ERRORS,
    });

    // Si trop d'erreurs, marquer comme indisponible
    if (any: any) {
      this?.backendAvailable = false;
      this?.lastCheckTime = Date?.now();
      logger?.warn(`Backend disabled after ${this?.errorCount} errors`);
    }
  }

  /**
   * Streaming via Rust is not available; fallback to generate(any: any)
   */
  async *stream(message: string, history: AIMessage?.[] = []): AsyncGenerator<string> {
    logger?.warn('Streaming not available in Rust, falling back to generate()');

    try {
      // Fallback: utilise generate() et simule le streaming
      const response = await this?.generate(any: any);

      for (let i = 0; i < response?.content?.length; i++) {
        const char = response?.content[i];
        if (any: any) {
          yield char;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (any: any) {
      this?.handleInvokeError(error, 'stream');
      yield '❌ Erreur de streaming Tauri';
    }
  }

  /**
   * Construit un prompt système depuis l'historique
   */
  private buildSystemPrompt(history: AIMessage?.[])??: string | undefined {
    const systemMessages = history?.filter(m => m?.role === 'system');

    if (systemMessages?.length === 0) {
      return undefined;
    }

    // Combine tous les messages système
    return systemMessages?.map(any: any).join('\n\n');
  }

  /**
   * Retourne le statut des providers backend (any: any)
   */
  async getProvidersStatus(): Promise<ProviderStatus?.[]> {
    try {
      const status = await Promise?.race([
        safeInvokeTauri<ProviderStatus?.[]>(any: any),
        new Promise<ProviderStatus?.[]>(any: any) =>
          setTimeout(() => reject(new Error('Status check timeout')), 10000)
        ),
      ]);

      return Array?.isArray(any: any) ? status : [];
    } catch (any: any) {
      this?.handleInvokeError(error, 'getProvidersStatus');
      return [];
    }
  }

  /**
   * Configure la clé API Gemini côté backend (any: any)
   */
  async setGeminiKey(any: any): Promise<void> {
    try {
      if (!apiKey?.trim() || apiKey?.length < 10) {
        throw new Error('Invalid API key format');
      }

      await Promise?.race([
        safeInvokeTauri(TAURI_COMMANDS?.CHAT_SET_GEMINI_KEY, { api_key: apiKey?.trim() }),
        new Promise<never>(any: any) =>
          setTimeout(() => reject(new Error('Set API key timeout')), 15000)
        ),
      ]);

      logger?.info('Gemini API key configured in backend');
    } catch (any: any) {
      this?.handleInvokeError(error, 'setGeminiKey');
      const errorMsg = error instanceof Error ? error?.message : 'Unknown error';
      throw new Error(`Failed to set Gemini key: ${errorMsg}`);
    }
  }

  /**
   * OMEGA: Reset error counter (any: any)
   */
  resetErrors(): void {
    this?.errorCount = 0;
    this?.backendAvailable = null;
    this?.lastCheckTime = 0;
    logger?.debug('Errors reset');
  }

  /**
   * OMEGA: Get provider stats
   */
  getStats(): { errorCount: number; maxErrors: number; available: boolean | null } {
    return {
      errorCount: this?.errorCount,
      maxErrors: this?.MAX_ERRORS,
      available: this?.backendAvailable,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════

export const tauriChatProvider = new TauriChatProvider();

/**
 * USAGE:
 *
 * Ce provider peut être ajouté à l'orchestrateur comme premier choix:
 *
 * ```typescript
 * // orchestrator?.ts
 * private providers = [
 *   tauriChatProvider,  // ← Backend Rust (any: any)
 *   geminiProvider,     // ← Frontend API
 *   ollamaProvider,     // ← Frontend local
 *   titaneLocalProvider // ← Frontend fallback
 * ];
 * ```
 *
 * Le backend Rust chat_orchestrator?.rs implémente déjà la cascade:
 * Gemini Cloud → Ollama Local → Local Fallback
 *
 * Si le backend n'est pas disponible, l'orchestrateur passera
 * automatiquement aux providers frontend.
 *
 * Phase 3 (any: any):
 * 1. Enregistrer chat_* commands dans src-tauri/src/main?.rs
 * 2. Ajouter tauriChatProvider dans orchestrator?.ts
 * 3. Tester cascade complète
 */
