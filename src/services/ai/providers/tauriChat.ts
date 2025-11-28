/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — TAURI CHAT PROVIDER OMEGA (ISOLATION)
 *   PHASE 4Ω: Protection invoke() • Timeout handling • Error isolation
 *   Provider utilisant le backend Rust avec protection maximale
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIProvider, AIResponse } from '../types';
import { TAURI_COMMANDS } from '../../../core/commands/TAURI_COMMANDS';
import { safeInvokeTauri } from '../../../utils/tauriProtector';
import { autoHealEngine } from '../autoHealEngine';

const isDev = process.env.NODE_ENV === 'development';

// ═══════════════════════════════════════════════════════════════
// TYPES (matching Rust structs)
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
  images?: string[];
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
  models: string[];
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER CLASS
// ═══════════════════════════════════════════════════════════════

class TauriChatProvider implements AIProvider {
  readonly name = 'tauri-backend' as const;
  private backendAvailable: boolean | null = null;
  private lastCheckTime = 0;
  private readonly CHECK_INTERVAL = 30000; // 30s cache
  private errorCount = 0;
  private readonly MAX_ERRORS = 5;
  private readonly TIMEOUT_MS = 45000; // 45s timeout pour invoke

  /**
   * Vérifie si le backend chat_orchestrator est disponible (OMEGA Protected)
   */
  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    // Cache le résultat pendant 30s
    if (this.backendAvailable !== null && now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return this.backendAvailable;
    }

    // Si trop d'erreurs, considérer comme indisponible
    if (this.errorCount >= this.MAX_ERRORS) {
      isDev && console.warn(`⚠️ Tauri Backend: Disabled after ${this.errorCount} errors`);
      this.backendAvailable = false;
      this.lastCheckTime = now;
      return false;
    }

    try {
      isDev && console.log('🔍 Tauri Chat Provider OMEGA: Checking backend availability...');

      // OMEGA: Protected invoke with timeout
      const status = await Promise.race([
        safeInvokeTauri<ProviderStatus[]>(TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Backend check timeout')), 5000)
        )
      ]).catch((error) => {
        this.handleInvokeError(error, 'isAvailable');
        return null;
      });

      this.backendAvailable = status !== null && status.length > 0;
      this.lastCheckTime = now;

      if (this.backendAvailable) {
        this.errorCount = 0; // Reset error count on success
      }

      isDev && console.log(`   ${this.backendAvailable ? '✅' : '❌'} Backend available: ${this.backendAvailable}`);

      return this.backendAvailable;
    } catch (error) {
      this.handleInvokeError(error, 'isAvailable');
      this.backendAvailable = false;
      this.lastCheckTime = now;
      return false;
    }
  }

  /**
   * Génère une réponse via backend Rust (OMEGA Protected)
   */
  async generate(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    isDev && console.log('🦀 Tauri Chat Provider OMEGA: Sending to Rust backend...');

    try {
      // OMEGA: Input validation
      if (!message?.trim()) {
        throw new Error('Empty message');
      }

      if (message.length > 50000) {
        throw new Error('Message too long (max 50k chars)');
      }

      // OMEGA: Check if backend is available first
      const isAvail = await this.isAvailable();
      if (!isAvail) {
        throw new Error('Backend not available');
      }

      // Construit la requête
      const request: ChatRequest = {
        message: message.trim(),
        provider: 'auto', // Rust choisira gemini → ollama → local
        streaming: false,
        system_prompt: this.buildSystemPrompt(history),
      };

      isDev && console.log(`   📝 Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      isDev && console.log(`   📚 History: ${history.length} messages`);
      isDev && console.log(`   🎯 Provider mode: auto (cascade)`);

      // OMEGA: Protected invoke with timeout and retry
      const response = await Promise.race([
        safeInvokeTauri<ChatResponse>(TAURI_COMMANDS.CHAT_SEND_MESSAGE, { request }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Backend invoke timeout')), this.TIMEOUT_MS)
        )
      ]);

      if (!response?.success) {
        const error = response?.error || 'Backend returned error';
        throw new Error(error);
      }

      if (!response.message?.content?.trim()) {
        throw new Error('Empty response from backend');
      }

      isDev && console.log(`   ✅ Response received in ${response.latency_ms}ms`);
      isDev && console.log(`   🏷️  Provider: ${response.message.provider}, Model: ${response.message.model}`);
      isDev && console.log(`   📦 Content: ${response.message.content.length} chars`);

      // Reset error count on success
      this.errorCount = 0;

      // Map backend provider names to frontend types
      const providerMap: Record<string, import('../types').AIProviderName> = {
        gemini: 'tauri-gemini',
        ollama: 'tauri-ollama',
        local: 'tauri-local',
      };

      return {
        content: response.message.content,
        provider: providerMap[response.message.provider] || 'tauri-backend',
        timestamp: response.message.timestamp || Date.now(),
        model: response.message.model || 'unknown',
        tokens: response.message.tokens,
      };
    } catch (error) {
      this.handleInvokeError(error, 'generate', { message: message.substring(0, 100) });
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Backend chat failed: ${errorMsg}`);
    }
  }

  /**
   * OMEGA: Error handler avec auto-heal integration
   */
  private handleInvokeError(error: unknown, context: string, metadata?: any): void {
    this.errorCount++;

    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Auto-heal trigger
    autoHealEngine.heal('tauri-chat', errorObj, 'provider', {
      context,
      errorCount: this.errorCount,
      metadata,
      timestamp: Date.now()
    });

    isDev && console.error(`   ❌ Tauri invoke error [${context}]: ${errorObj.message} (${this.errorCount}/${this.MAX_ERRORS})`);

    // Si trop d'erreurs, marquer comme indisponible
    if (this.errorCount >= this.MAX_ERRORS) {
      this.backendAvailable = false;
      this.lastCheckTime = Date.now();
      isDev && console.warn(`   🚫 Tauri backend disabled after ${this.errorCount} errors`);
    }
  }

  /**
   * Stream pas encore implémenté côté Rust (OMEGA Protected)
   */
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    isDev && console.warn('⚠️ Tauri Chat Provider OMEGA: Streaming not implemented, falling back to generate()');

    try {
      // Fallback: utilise generate() et simule le streaming
      const response = await this.generate(message, history);

      for (let i = 0; i < response.content.length; i++) {
        const char = response.content[i];
        if (char !== undefined) {
          yield char;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (error) {
      this.handleInvokeError(error, 'stream');
      yield '❌ Erreur de streaming Tauri';
    }
  }

  /**
   * Construit un prompt système depuis l'historique
   */
  private buildSystemPrompt(history: AIMessage[]): string | undefined {
    const systemMessages = history.filter((m) => m.role === 'system');

    if (systemMessages.length === 0) {
      return undefined;
    }

    // Combine tous les messages système
    return systemMessages.map((m) => m.content).join('\n\n');
  }

  /**
   * Retourne le statut des providers backend (OMEGA Protected)
   */
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    try {
      const status = await Promise.race([
        safeInvokeTauri<ProviderStatus[]>(TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS),
        new Promise<ProviderStatus[]>((_, reject) =>
          setTimeout(() => reject(new Error('Status check timeout')), 10000)
        )
      ]);

      return Array.isArray(status) ? status : [];
    } catch (error) {
      this.handleInvokeError(error, 'getProvidersStatus');
      return [];
    }
  }

  /**
   * Configure la clé API Gemini côté backend (OMEGA Protected)
   */
  async setGeminiKey(apiKey: string): Promise<void> {
    try {
      if (!apiKey?.trim() || apiKey.length < 10) {
        throw new Error('Invalid API key format');
      }

      await Promise.race([
        safeInvokeTauri(TAURI_COMMANDS.CHAT_SET_GEMINI_KEY, { api_key: apiKey.trim() }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Set API key timeout')), 15000)
        )
      ]);

      isDev && console.log('✅ Gemini API key configured in backend');
    } catch (error) {
      this.handleInvokeError(error, 'setGeminiKey');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to set Gemini key: ${errorMsg}`);
    }
  }

  /**
   * OMEGA: Reset error counter (for auto-heal)
   */
  resetErrors(): void {
    this.errorCount = 0;
    this.backendAvailable = null;
    this.lastCheckTime = 0;
    isDev && console.log('🔄 Tauri Chat Provider: Errors reset');
  }

  /**
   * OMEGA: Get provider stats
   */
  getStats(): { errorCount: number, maxErrors: number, available: boolean | null } {
    return {
      errorCount: this.errorCount,
      maxErrors: this.MAX_ERRORS,
      available: this.backendAvailable
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
 * // orchestrator.ts
 * private providers = [
 *   tauriChatProvider,  // ← Backend Rust (si disponible)
 *   geminiProvider,     // ← Frontend API
 *   ollamaProvider,     // ← Frontend local
 *   titaneLocalProvider // ← Frontend fallback
 * ];
 * ```
 *
 * Le backend Rust chat_orchestrator.rs implémente déjà la cascade:
 * Gemini Cloud → Ollama Local → Local Fallback
 *
 * Si le backend n'est pas disponible, l'orchestrateur passera
 * automatiquement aux providers frontend.
 *
 * TODO Phase 3:
 * 1. Enregistrer chat_* commands dans src-tauri/src/main.rs
 * 2. Ajouter tauriChatProvider dans orchestrator.ts
 * 3. Tester cascade complète
 */
