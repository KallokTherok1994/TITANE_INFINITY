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
  const classification = classifyError(new Error('FRONTEND_NETWORK_DISABLED'));
  return {
    content: classification.message,
    conversationId: request.conversationId,
    messageId: `error-${Date.now()}`,
    latencyMs: Date.now() - startTime,
    metadata: {
      intention: 'Error',
      emotion: 'Erreur',
      cognitiveTags: ['error', 'ipc-error'],
      cognitiveSummary: 'Fallback HTTP frontend désactivé (tauri-only)',
      requestId: request.requestId,
    },
  };
}
