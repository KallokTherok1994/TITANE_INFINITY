/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 — AI STREAMING CHAT CLIENT
 * Client IA avec support streaming réel via Tauri events
 * ═══════════════════════════════════════════════════════════════
 */

import {
  tauriClient,
  type ChatRequest,
  type StreamCallbacks,
  type TAPIError,
} from './tauriClient';

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

export type StreamCallbacksLegacy = {
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
 * Client AI avec support streaming réel via Tauri
 */
class AIChatClient {
  private circuitBreaker = new CircuitBreaker();
  private abortControllers = new Map<string, () => void>();

  /**
   * Envoie un message avec streaming token-by-token (VRAI streaming via Tauri events)
   * @param message Message utilisateur
   * @param callbacks Callbacks pour gérer le stream
   * @param options Options (model, temperature, etc.)
   * @returns Request ID pour cancel
   */
  async sendMessageStreaming(
    message: string,
    callbacks: StreamCallbacksLegacy = {},
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    try {
      await this.circuitBreaker.execute(async () => {
        const request: ChatRequest = {
          message,
          provider: 'auto',
          model: options.model,
          streaming: true,
          system_prompt: options.systemPrompt,
        };

        // Convertir callbacks legacy vers nouveau format
        const tauriCallbacks: StreamCallbacks = {
          onChunk: callbacks.onChunk,
          onComplete: data => {
            if (callbacks.onComplete) {
              callbacks.onComplete(data.content);
            }
          },
          onError: (error: TAPIError) => {
            if (callbacks.onError) {
              callbacks.onError(new Error(`[${error.kind}] ${error.message}`));
            }
          },
        };

        // Utiliser le vrai streaming Tauri
        await tauriClient.chatStreamMessage(request, tauriCallbacks);
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
    const cancelFn = this.abortControllers.get(requestId);
    if (cancelFn) {
      cancelFn();
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
          const request: ChatRequest = {
            message,
            provider: 'auto',
            model: options.model,
            streaming: false,
            system_prompt: options.systemPrompt,
          };

          const response = await tauriClient.chatSendMessage(request);
          return response.message.content;
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
