/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — AI SERVICE ENGINE (DEPRECATED)
 *
 *   ⚠️ DEPRECATED: Ce fichier est obsolète.
 *   Utilisez tauriClient.chatSendMessage() à la place.
 *
 *   Ce wrapper maintient la compatibilité legacy.
 * ═══════════════════════════════════════════════════════════════════
 */

import { tauriClient } from './tauriClient';
import type { ChatRequest } from './tauriClient';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  content: string;
  provider: 'gemini' | 'ollama' | 'fallback';
  timestamp: number;
}

/**
 * @deprecated Utilisez tauriClient.chatSendMessage() à la place
 */
export async function askTitan(
  message: string,
  history: AIMessage[] = []
): Promise<AIResponse> {
  console.warn('⚠️ DEPRECATED: aiService.askTitan() → Utilisez tauriClient.chatSendMessage()');

  try {
    const request: ChatRequest = {
      message: message.trim(),
      provider: 'auto',
      streaming: false,
      system_prompt: 'Tu es TITANE∞, une IA avancée intégrée dans un système d\'auto-évolution cognitive.',
    };

    const response = await tauriClient.chatSendMessage(request);

    return {
      content: response.message.content,
      provider: response.message.provider as 'gemini' | 'ollama' | 'fallback',
      timestamp: response.message.timestamp,
    };
  } catch (error) {
    console.error('askTitan error:', error);

    return {
      content: "Je suis TITANE∞, mais mes services IA sont temporairement indisponibles.",
      provider: 'fallback',
      timestamp: Date.now(),
    };
  }
}

/**
 * @deprecated Utilisez tauriClient.chatStreamMessage() à la place
 */
export async function* streamTitanResponse(
  message: string,
  history: AIMessage[] = []
): AsyncGenerator<string> {
  console.warn('⚠️ DEPRECATED: aiService.streamTitanResponse() → Utilisez tauriClient.chatStreamMessage()');

  const response = await askTitan(message, history);

  for (let i = 0; i < response.content.length; i++) {
    yield response.content[i] as string;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

export default {
  askTitan,
  streamTitanResponse,
};
