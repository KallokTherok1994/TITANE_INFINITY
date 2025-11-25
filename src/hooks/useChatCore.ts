/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — USE CHAT CORE (Logic IA Pure)
 *   Hook isolé: Logique IA uniquement, 0 UI
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { chatValidator } from '../services/chatValidator';

export interface UseChatCoreOptions {
  mode?: ChatMode;
  emotionState?: { valence: number; intensity: number; energy: number };
  onResponse?: (response: ChatEngineResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseChatCoreReturn {
  currentMode: ChatMode;
  anomalyCount: number;
  generate: (message: string, history: AIMessage[]) => Promise<ChatEngineResponse>;
  setMode: (mode: ChatMode) => void;
  validateResponse: (content: string, mode: ChatMode, prompt: string) => {
    isValid: boolean;
    score: number;
    issues: Array<{ type: string; severity: string; message: string }>;
    cleaned?: string;
  };
}

/**
 * Hook logique IA pure
 * - 0 UI
 * - 0 state messages
 * - 0 loading state
 * - Génération IA uniquement
 */
export function useChatCore(options: UseChatCoreOptions = {}): UseChatCoreReturn {
  const [currentMode, setCurrentMode] = useState<ChatMode>(options.mode || 'default');
  const [anomalyCount, setAnomalyCount] = useState(0);

  /**
   * Génère réponse IA (logique pure)
   */
  const generate = useCallback(
    async (message: string, history: AIMessage[]): Promise<ChatEngineResponse> => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  USE CHAT CORE: Generation start (logic only)              ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log(`🎯 Mode: ${currentMode}`);
      console.log(`📝 Prompt: "${message.substring(0, 60)}..."`);

      try {
        // Configure mode
        chatEngine.setMode(currentMode, {
          emotionState: options.emotionState,
        });

        // Timeout 30s (Gemini peut être lent)
        const generatePromise = chatEngine.generate(message, history);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: AI took >30s')), 30000)
        );

        const response: ChatEngineResponse = await Promise.race([
          generatePromise,
          timeoutPromise,
        ]);

        console.log(`✅ Response received (${response.content.length} chars)`);
        console.log(`🏷️  Provider: ${response.provider}`);

        // SENTINEL validation
        const validation = chatValidator.validate(response.content, currentMode, message);
        if (!validation.isValid) {
          console.warn(`⚠️ SENTINEL: Quality issue (score: ${(validation.score * 100).toFixed(0)}%)`);
          setAnomalyCount((prev) => prev + 1);

          if (validation.cleaned) {
            console.log('🧹 Using cleaned response');
            response.content = validation.cleaned;
          }
        } else {
          console.log(`✅ NEXUS: Validated (score: ${(validation.score * 100).toFixed(0)}%)`);
        }

        // Callback success
        options.onResponse?.(response);

        console.log('╚════════════════════════════════════════════════════════════╝\n');
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown AI error');
        console.error('❌ USE CHAT CORE: Error', error);

        // Callback error
        options.onError?.(error);

        throw error;
      }
    },
    [currentMode, options.emotionState, options.onResponse, options.onError]
  );

  /**
   * Valide réponse (NEXUS/SENTINEL)
   */
  const validateResponse = useCallback(
    (content: string, mode: ChatMode, prompt: string) => {
      return chatValidator.validate(content, mode, prompt);
    },
    []
  );

  /**
   * Change mode (avec reset cognitif automatique dans chatEngine)
   */
  const setMode = useCallback((mode: ChatMode) => {
    console.log(`🔄 USE CHAT CORE: Mode change → ${mode}`);
    setCurrentMode(mode);
  }, []);

  return {
    currentMode,
    anomalyCount,
    generate,
    setMode,
    validateResponse,
  };
}
