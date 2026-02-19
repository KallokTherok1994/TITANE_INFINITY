/**
 * TITANE∞ Ollama Fallback v20.5
 * Fallback via proxy Ollama quand le backend Tauri est indisponible
 */

import { classifyError } from '@/lib/errorClassification';

export interface OllamaRequest {
  message: string;
  conversationId: string;
  mode?: string;
  provider?: string;
  systemPrompt?: string;
  requestId?: string;
}

export interface OllamaResponse {
  content: string;
  conversationId: string;
  messageId: string;
  latencyMs: number;
  metadata: {
    intention: string;
    emotion: string;
    cognitiveTags: string[];
    cognitiveSummary: string;
    requestId?: string;
  };
}

/**
 * Appel via proxy Ollama (fallback mode)
 */
export async function callOllamaDirectly(
  request: OllamaRequest
): Promise<OllamaResponse> {
  const startTime = Date.now();
  const ollamaEndpoint = '/api/ollama/generate';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(ollamaEndpoint, {
      // @network-allowed: local Ollama HTTP fallback (localhost only)
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:latest',
        prompt: request.message,
        stream: false,
        options: {
          temperature: 0.7,
        },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    // Generate a unique message ID
    const messageId = `ollama-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      content: data.response || "Désolé, je n'ai pas pu générer de réponse.",
      conversationId: request.conversationId,
      messageId,
      latencyMs,
      metadata: {
        intention: 'Question', // Default intention
        emotion: 'Neutre', // Default emotion
        cognitiveTags: ['ollama-fallback', 'direct-call'],
        cognitiveSummary: `Réponse générée via Ollama direct en ${latencyMs}ms`,
        requestId: request.requestId,
      },
    };
  } catch (error) {
    console.error('[OllamaFallback] Error calling Ollama directly:', error);

    // ✅ IPC FIX (Ω∞.v1): Classify error before assuming Ollama unavailable
    const classification = classifyError(error);
    const message =
      classification.type === 'ipc' ||
      classification.type === 'timeout' ||
      classification.type === 'abort'
        ? classification.message
        : 'Ollama indisponible. TITANE bascule en mode local.';

    // Return error as content
    return {
      content: message,
      conversationId: request.conversationId,
      messageId: `error-${Date.now()}`,
      latencyMs: Date.now() - startTime,
      metadata: {
        intention: 'Error',
        emotion: 'Erreur',
        cognitiveTags: [
          'error',
          classification.type === 'ipc' ? 'ipc-error' : 'ollama-unreachable',
        ],
        cognitiveSummary:
          classification.type === 'ipc'
            ? 'Erreur IPC contract'
            : 'Échec de connexion à Ollama',
        requestId: request.requestId,
      },
    };
  }
}
