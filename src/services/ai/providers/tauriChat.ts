/**
 * TITANE_INFINITY v18 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v18 — TAURI CHAT PROVIDER
 *   Provider utilisant le backend Rust chat_orchestrator.rs
 *   Fallback automatique sur frontend si backend indisponible
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIProvider, AIResponse } from '../types';
import { TAURI_COMMANDS, invokeTauri } from '../../../core/commands/TAURI_COMMANDS';

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

  /**
   * Vérifie si le backend chat_orchestrator est disponible
   */
  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    // Cache le résultat pendant 30s
    if (this.backendAvailable !== null && now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return this.backendAvailable;
    }

    try {
      console.log('🔍 Tauri Chat Provider: Checking backend availability...');

      // Teste si la commande existe
      const status = await invokeTauri<ProviderStatus[]>(
        TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS
      ).catch(() => null);

      this.backendAvailable = status !== null && status.length > 0;
      this.lastCheckTime = now;

      console.log(`   ${this.backendAvailable ? '✅' : '❌'} Backend available: ${this.backendAvailable}`);

      return this.backendAvailable;
    } catch (error) {
      console.warn('⚠️ Tauri Chat Provider: Backend not available (fallback to frontend)');
      this.backendAvailable = false;
      this.lastCheckTime = now;
      return false;
    }
  }

  /**
   * Génère une réponse via backend Rust
   */
  async generate(message: string, history: AIMessage[] = []): Promise<AIResponse> {
    console.log('🦀 Tauri Chat Provider: Sending to Rust backend...');

    try {
      // Construit la requête
      const request: ChatRequest = {
        message,
        provider: 'auto', // Rust choisira gemini → ollama → local
        streaming: false,
        system_prompt: this.buildSystemPrompt(history),
      };

      console.log(`   📝 Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      console.log(`   📚 History: ${history.length} messages`);
      console.log(`   🎯 Provider mode: auto (cascade)`);

      // Appelle le backend
      const response = await invokeTauri<ChatResponse>(
        TAURI_COMMANDS.CHAT_SEND_MESSAGE,
        { request }
      );

      if (!response.success) {
        throw new Error(response.error || 'Backend returned error');
      }

      console.log(`   ✅ Response received in ${response.latency_ms}ms`);
      console.log(`   🏷️  Provider: ${response.message.provider}, Model: ${response.message.model}`);
      console.log(`   📦 Content: ${response.message.content.length} chars`);

      // Map backend provider names to frontend types
      const providerMap: Record<string, import('../types').AIProviderName> = {
        gemini: 'tauri-gemini',
        ollama: 'tauri-ollama',
        local: 'tauri-local',
      };

      return {
        content: response.message.content,
        provider: providerMap[response.message.provider] || 'tauri-backend',
        timestamp: response.message.timestamp,
        model: response.message.model,
        tokens: response.message.tokens,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Tauri Chat Provider failed: ${errorMsg}`);
      throw new Error(`Backend chat failed: ${errorMsg}`);
    }
  }

  /**
   * Stream pas encore implémenté côté Rust
   */
  async *stream(message: string, history: AIMessage[] = []): AsyncGenerator<string> {
    console.warn('⚠️ Tauri Chat Provider: Streaming not implemented, falling back to generate()');

    // Fallback: utilise generate() et simule le streaming
    const response = await this.generate(message, history);

    for (let i = 0; i < response.content.length; i++) {
      const char = response.content[i];
      if (char !== undefined) {
        yield char;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
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
   * Retourne le statut des providers backend
   */
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    try {
      return await invokeTauri<ProviderStatus[]>(
        TAURI_COMMANDS.CHAT_GET_PROVIDERS_STATUS
      );
    } catch {
      return [];
    }
  }

  /**
   * Configure la clé API Gemini côté backend
   */
  async setGeminiKey(apiKey: string): Promise<void> {
    try {
      await invokeTauri(TAURI_COMMANDS.CHAT_SET_GEMINI_KEY, { api_key: apiKey });
      console.log('✅ Gemini API key configured in backend');
    } catch (error) {
      console.error('❌ Failed to set Gemini key in backend:', error);
      throw error;
    }
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
