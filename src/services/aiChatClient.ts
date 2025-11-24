/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — AI STREAMING CHAT CLIENT
 * Support SSE (Server-Sent Events) pour streaming token-by-token
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

export type StreamChunk = {
  content: string;
  done: boolean;
  error?: string;
};

export type StreamCallbacks = {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
};

/**
 * Circuit Breaker pour gérer les erreurs d'API
 */
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  private readonly failureThreshold = 3;
  private readonly resetTimeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const isOpen = this.state === 'open';
    const shouldReset = Date.now() - this.lastFailureTime > this.resetTimeout;

    if (isOpen) {
      if (shouldReset) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open - API temporarily unavailable');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
      }
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
      }
      throw error;
    }
  }

  getState() {
    return this.state;
  }
}

/**
 * Client AI avec support streaming SSE
 */
class AIChatClient {
  private circuitBreaker = new CircuitBreaker();
  private abortControllers = new Map<string, AbortController>();

  /**
   * Envoie un message avec streaming token-by-token
   * @param message Message utilisateur
   * @param callbacks Callbacks pour gérer le stream
   * @param options Options (model, temperature, etc.)
   * @returns Request ID pour cancel
   */
  async sendMessageStreaming(
    message: string,
    callbacks: StreamCallbacks = {},
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      await this.circuitBreaker.execute(async () => {
        let fullResponse = '';

        // Simuler SSE streaming (en attente de backend Tauri SSE)
        // Pour l'instant, découpe la réponse en chunks
        const response = await invoke<string>('ai_chat_stream', {
          message,
          model: options.model || 'gpt-4',
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 500,
          systemPrompt: options.systemPrompt || 'You are TITANE∞ AI assistant.',
        });

        // Simuler streaming en découpant la réponse
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          if (abortController.signal.aborted) {
            throw new Error('Request aborted');
          }

          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          fullResponse += chunk;

          if (callbacks.onChunk) {
            callbacks.onChunk(chunk);
          }

          // Simuler délai réseau
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        if (callbacks.onComplete) {
          callbacks.onComplete(fullResponse);
        }

        return fullResponse;
      });

      return requestId;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (callbacks.onError) {
        callbacks.onError(err);
      }
      throw err;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Annule une requête en cours
   * @param requestId ID de la requête
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Envoie un message sans streaming (fallback)
   * @param message Message utilisateur
   * @param options Options
   * @returns Réponse complète
   */
  async sendMessage(
    message: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      retries?: number;
    } = {}
  ): Promise<string> {
    const retries = options.retries || 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await this.circuitBreaker.execute(async () => {
          const response = await invoke<string>('ai_chat_send', {
            message,
            model: options.model || 'gpt-4',
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 500,
            systemPrompt: options.systemPrompt || 'You are TITANE∞ AI assistant.',
          });
          return response;
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to send message after retries');
  }

  /**
   * Obtient l'état du circuit breaker
   */
  getStatus() {
    return {
      circuitState: this.circuitBreaker.getState(),
      activeRequests: this.abortControllers.size,
    };
  }
}

// Export singleton instance
export const aiChatClient = new AIChatClient();
export default aiChatClient;
