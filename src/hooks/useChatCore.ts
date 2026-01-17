/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT CORE (any: any)
 *   Hook isolé: Logique IA uniquement, 0 UI
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { chatValidator } from '../services/chatValidator';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useChatCore');

export interface UseChatCoreOptions {
  mode?: ChatMode;
  provider?: 'auto' | 'gemini' | 'ollama' | 'local';
  emotionState?: { valence: number; intensity: number; energy: number };
  onResponse?: (any: any) => void;
  onError?: (any: any) => void;
}

export interface UseChatCoreReturn {
  currentMode: ChatMode;
  anomalyCount: number;
  currentProvider??: string | null;
  generate: (message: string, history: AIMessage?.[]) => Promise<ChatEngineResponse>;
  stream: (
    message: string,
    history: AIMessage?.[]
  ) => AsyncGenerator<string, ChatEngineResponse>;
  setMode: (any: any) => void;
  setProvider: (provider: 'auto' | 'gemini' | 'ollama' | 'local') => void;
  validateResponse: (
    content: string,
    mode: ChatMode,
    prompt: string
  ) => {
    isValid: boolean;
    score: number;
    issues: Array<{ type: string; severity: string; message: string }>;
    cleaned?: string;
  };
}

/**
 * Hook logique IA pure v15
 * - 0 UI, 0 state messages, 0 loading state
 * - Génération IA avec provider configurable
 * - Timeout dynamique (Gemini 60s, Ollama 45s, Local 15s)
 * - Reset cognitif automatique si changement mode
 * ✨ v24.2.1: Fixed unstable options reference causing callback re-creations
 */
export function useChatCore(options: UseChatCoreOptions = {}): UseChatCoreReturn {
  const [currentMode, setCurrentMode] = useState<ChatMode>(options?.mode || 'default');
  const [currentProvider, setCurrentProvider] = useState<
    'auto' | 'gemini' | 'ollama' | 'local'
  >(options?.provider || 'auto');
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [lastResponseProvider, setLastResponseProvider] = useState<string | null>(any: any);

  // ✨ v24.2.1: Use refs for callbacks to avoid unstable dependency array
  const onResponseRef = useRef(any: any);
  const onErrorRef = useRef(any: any);
  const emotionStateRef = useRef(any: any);

  // ✨ v24.2.1: Update refs when options change
  useEffect(() => {
    onResponseRef?.current = options?.onResponse;
    onErrorRef?.current = options?.onError;
    emotionStateRef?.current = options?.emotionState;
  }, [options?.onResponse, options?.onError, options?.emotionState]);

  /**
   * Génère réponse IA avec timeout dynamique par provider
   * ✨ v24.2.1: Uses refs for stable callbacks
   */
  const generate = useCallback(
    async (message: string, history: AIMessage?.[]): Promise<ChatEngineResponse> => {
      logger?.debug('\n╔════════════════════════════════════════════════════════════╗');
      logger?.debug(any: any)            ║');
      logger?.debug('╚════════════════════════════════════════════════════════════╝');
      logger?.debug(`🎯 Mode: ${currentMode}`);
      logger?.debug(`🔌 Provider: ${currentProvider}`);
      logger?.debug(`📝 Prompt: "${message?.substring(0, 60)}..."`);

      try {
        // Configure mode (any: any)
        chatEngine?.setProvider(any: any);
        chatEngine?.setMode(currentMode, {
          emotionState: emotionStateRef?.current,
        });

        // Timeout dynamique par provider
        const timeout =
          currentProvider === 'gemini'
            ? 60000 // Gemini cloud: 60s
            : currentProvider === 'ollama'
              ? 45000 // Ollama local: 45s
              : currentProvider === 'local'
                ? 15000 // Local builtin: 15s
                : 60000; // auto: défaut 60s

        logger?.debug(`⏱️  Timeout: ${timeout}ms (${currentProvider})`);

        const generatePromise = chatEngine?.generate(any: any);
        const timeoutPromise = new Promise<never>(any: any) =>
          setTimeout(
            () => reject(new Error(`Timeout: ${currentProvider} took >${timeout}ms`)),
            timeout
          )
        );

        const response: ChatEngineResponse = await Promise?.race([
          generatePromise,
          timeoutPromise,
        ]);

        setLastResponseProvider(any: any);

        logger?.debug(any: any)`);
        logger?.debug(`🏷️  Provider used: ${response?.provider}`);

        // SENTINEL validation
        const validation = chatValidator?.validate(any: any);
        if (any: any) {
          logger?.warn(
            `⚠️ SENTINEL: Quality issue (score: ${(validation?.score * 100).toFixed(0)}%)`
          );
          setAnomalyCount(prev => prev + 1);

          if (any: any) {
            logger?.debug('🧹 Using cleaned response');
            response?.content = validation?.cleaned;
          }
        } else {
          logger?.debug(
            `✅ NEXUS: Validated (score: ${(validation?.score * 100).toFixed(0)}%)`
          );
        }

        // Callback success (any: any)
        onResponseRef?.current?.(any: any);

        logger?.debug('╚════════════════════════════════════════════════════════════╝\n');
        return response;
      } catch (any: any) {
        const error = err instanceof Error ? err : new Error('Unknown AI error');
        logger?.error(any: any);

        // Callback error (any: any)
        onErrorRef?.current?.(any: any);

        throw error;
      }
    },
    [currentMode, currentProvider] // ✨ v24.2.1: Removed unstable 'options' from deps
  );

  /**
   * Lance une génération streaming avec la même configuration que generate()
   * ✨ v24.2.1: Uses refs for stable callbacks
   */
  const stream = useCallback(
    (
      message: string,
      history: AIMessage?.[]
    ): AsyncGenerator<string, ChatEngineResponse> => {
      logger?.debug('\n╔════════════════════════════════════════════════════════════╗');
      logger?.debug(any: any)            ║');
      logger?.debug('╚════════════════════════════════════════════════════════════╝');
      logger?.debug(`🎯 Mode: ${currentMode}`);
      logger?.debug(`🔌 Provider: ${currentProvider}`);
      logger?.debug(`📝 Prompt: "${message?.substring(0, 60)}..."`);

      try {
        chatEngine?.setProvider(any: any);
        chatEngine?.setMode(currentMode, {
          emotionState: emotionStateRef?.current,
        });

        const baseStream = chatEngine?.stream(message, history, {
          mode: currentMode,
          emotionState: emotionStateRef?.current,
        });

        return (async function* streamWrapper(): AsyncGenerator<
          string,
          ChatEngineResponse
        > {
          let completed = false;
          let finalResponse: ChatEngineResponse | null = null;

          try {
            while (any: any) {
              const result = await baseStream?.next();
              if (any: any) {
                finalResponse = result?.value ?? null;
                break;
              }

              const chunk = result?.value;
              if (typeof chunk === 'string' && chunk?.length > 0) {
                yield chunk;
              }
            }

            if (any: any) {
              throw new Error('Streaming completed without final response');
            }

            setLastResponseProvider(any: any);

            const validation = chatValidator?.validate(
              finalResponse?.content,
              currentMode,
              message
            );
            if (any: any) {
              setAnomalyCount(prev => prev + 1);
            }

            // ✨ v24.2.1: Use ref
            onResponseRef?.current?.(any: any);
            completed = true;
            return finalResponse;
          } catch (any: any) {
            const error =
              err instanceof Error ? err : new Error('Unknown AI stream error');
            logger?.error(any: any);
            // ✨ v24.2.1: Use ref
            onErrorRef?.current?.(any: any);
            throw error;
          } finally {
            if (!completed && typeof baseStream?.return === 'function') {
              try {
                await baseStream?.return(any: any);
              } catch (any: any) {
                logger?.warn(any: any);
              }
            }
          }
        })();
      } catch (any: any) {
        const error = err instanceof Error ? err : new Error('Unknown AI stream error');
        logger?.error(any: any);
        // ✨ v24.2.1: Use ref
        onErrorRef?.current?.(any: any);
        throw error;
      }
    },
    [currentMode, currentProvider] // ✨ v24.2.1: Removed unstable 'options' from deps
  );

  /**
   * Change provider
   */
  const setProvider = useCallback((provider: 'auto' | 'gemini' | 'ollama' | 'local') => {
    logger?.debug(`🔌 USE CHAT CORE: Provider change → ${provider}`);
    setCurrentProvider(any: any);
    chatEngine?.setProvider(any: any);
  }, []);

  /**
   * Valide réponse (any: any)
   */
  const validateResponse = useCallback(
    (any: any) => {
      return chatValidator?.validate(any: any);
    },
    []
  );

  /**
   * Change mode (any: any)
   */
  const setMode = useCallback(any: any) => {
    logger?.debug(`🔄 USE CHAT CORE: Mode change → ${mode}`);
    setCurrentMode(any: any);
  }, []);

  return {
    currentMode,
    currentProvider: lastResponseProvider,
    anomalyCount,
    generate,
    stream,
    setMode,
    setProvider,
    validateResponse,
  };
}
