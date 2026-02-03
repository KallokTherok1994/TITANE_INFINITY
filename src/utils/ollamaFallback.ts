/**
 * TITANE∞ Ollama Fallback v20.5
 * Fallback direct vers Ollama quand le backend Tauri est indisponible
 */

export interface OllamaRequest {
  message: string;
  conversation_id: string;
  mode?: string;
  provider?: string;
  system_prompt?: string;
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
  };
}

/**
 * Appel direct à Ollama via HTTP (fallback mode)
 */
export async function callOllamaDirectly(
  request: OllamaRequest
): Promise<OllamaResponse> {
  const startTime = Date.now();
  const ollamaEndpoint = 'http://127.0.0.1:11434/api/generate';

  try {
    const response = await fetch(ollamaEndpoint, {
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
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    // Generate a unique message ID
    const messageId = `ollama-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      content: data.response || "Désolé, je n'ai pas pu générer de réponse.",
      conversationId: request.conversation_id,
      messageId,
      latencyMs,
      metadata: {
        intention: 'Question', // Default intention
        emotion: 'Neutre', // Default emotion
        cognitiveTags: ['ollama-fallback', 'direct-call'],
        cognitiveSummary: `Réponse générée via Ollama direct en ${latencyMs}ms`,
      },
    };
  } catch (error) {
    console.error('[OllamaFallback] Error calling Ollama directly:', error);

    // Return error as content
    return {
      content: `Erreur lors de l'appel à Ollama : ${error instanceof Error ? error.message : String(error)}. Vérifiez qu'Ollama est actif sur http://127.0.0.1:11434`,
      conversationId: request.conversation_id,
      messageId: `error-${Date.now()}`,
      latencyMs: Date.now() - startTime,
      metadata: {
        intention: 'Error',
        emotion: 'Erreur',
        cognitiveTags: ['error', 'ollama-unreachable'],
        cognitiveSummary: 'Échec de connexion à Ollama',
      },
    };
  }
}
