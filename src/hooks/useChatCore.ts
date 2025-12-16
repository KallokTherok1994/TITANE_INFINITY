/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT CORE (Logic IA Pure)
 *   Hook isolé: Logique IA uniquement, 0 UI
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { chatValidator } from '../services/chatValidator';

export interface UseChatCoreOptions {
  mode?: ChatMode;
  provider?: 'auto' | 'gemini' | 'ollama' | 'local';
  emotionState?: { valence: number; intensity: number; energy: number };
  onResponse?: (response: ChatEngineResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseChatCoreReturn {
  currentMode: ChatMode;
  anomalyCount: number;
  currentProvider: string | null;
  generate: (message: string, history: AIMessage[]) => Promise<ChatEngineResponse>;
  stream: (
    message: string,
    history: AIMessage[]
  ) => AsyncGenerator<string, ChatEngineResponse>;
  setMode: (mode: ChatMode) => void;
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
  const [currentMode, setCurrentMode] = useState<ChatMode>(options.mode || 'default');
  const [currentProvider, setCurrentProvider] = useState<
    'auto' | 'gemini' | 'ollama' | 'local'
  >(options.provider || 'auto');
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [lastResponseProvider, setLastResponseProvider] = useState<string | null>(null);

  // ✨ v24.2.1: Use refs for callbacks to avoid unstable dependency array
  const onResponseRef = useRef(options.onResponse);
  const onErrorRef = useRef(options.onError);
  const emotionStateRef = useRef(options.emotionState);

  // ✨ v24.2.1: Update refs when options change
  useEffect(() => {
    onResponseRef.current = options.onResponse;
    onErrorRef.current = options.onError;
    emotionStateRef.current = options.emotionState;
  }, [options.onResponse, options.onError, options.emotionState]);

  /**
   * Génère réponse IA avec timeout dynamique par provider
   * ✨ v24.2.1: Uses refs for stable callbacks
   */
  const generate = useCallback(
    async (message: string, history: AIMessage[]): Promise<ChatEngineResponse> => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  USE CHAT CORE v15: Generation (provider-aware)            ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log(`🎯 Mode: ${currentMode}`);
      console.log(`🔌 Provider: ${currentProvider}`);
      console.log(`📝 Prompt: "${message.substring(0, 60)}..."`);

      try {
        // Configure mode (reset cognitif automatique dans chatEngine)
        chatEngine.setProvider(currentProvider);
        chatEngine.setMode(currentMode, {
          emotionState: emotionStateRef.current,
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

        console.log(`⏱️  Timeout: ${timeout}ms (${currentProvider})`);

        const generatePromise = chatEngine.generate(message, history);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout: ${currentProvider} took >${timeout}ms`)),
            timeout
          )
        );

        const response: ChatEngineResponse = await Promise.race([
          generatePromise,
          timeoutPromise,
        ]);

        setLastResponseProvider(response.provider);

        console.log(`✅ Response received (${response.content.length} chars)`);
        console.log(`🏷️  Provider used: ${response.provider}`);

        // SENTINEL validation
        const validation = chatValidator.validate(response.content, currentMode, message);
        if (!validation.isValid) {
          console.warn(
            `⚠️ SENTINEL: Quality issue (score: ${(validation.score * 100).toFixed(0)}%)`
          );
          setAnomalyCount(prev => prev + 1);

          if (validation.cleaned) {
            console.log('🧹 Using cleaned response');
            response.content = validation.cleaned;
          }
        } else {
          console.log(
            `✅ NEXUS: Validated (score: ${(validation.score * 100).toFixed(0)}%)`
          );
        }

        // Callback success (✨ v24.2.1: use ref)
        onResponseRef.current?.(response);

        console.log('╚════════════════════════════════════════════════════════════╝\n');
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown AI error');
        console.error('❌ USE CHAT CORE: Error', error);

        // Callback error (✨ v24.2.1: use ref)
        onErrorRef.current?.(error);

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
      history: AIMessage[]
    ): AsyncGenerator<string, ChatEngineResponse> => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  USE CHAT CORE v15: Streaming (provider-aware)            ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log(`🎯 Mode: ${currentMode}`);
      console.log(`🔌 Provider: ${currentProvider}`);
      console.log(`📝 Prompt: "${message.substring(0, 60)}..."`);

      try {
        chatEngine.setProvider(currentProvider);
        chatEngine.setMode(currentMode, {
          emotionState: emotionStateRef.current,
        });

        const baseStream = chatEngine.stream(message, history, {
          mode: currentMode,
          emotionState: emotionStateRef.current,
        });

        return (async function* streamWrapper(): AsyncGenerator<
          string,
          ChatEngineResponse
        > {
          let completed = false;
          let finalResponse: ChatEngineResponse | null = null;

          try {
            while (true) {
              const result = await baseStream.next();
              if (result.done) {
                finalResponse = result.value ?? null;
                break;
              }

              const chunk = result.value;
              if (typeof chunk === 'string' && chunk.length > 0) {
                yield chunk;
              }
            }

            if (!finalResponse) {
              throw new Error('Streaming completed without final response');
            }

            setLastResponseProvider(finalResponse.provider);

            const validation = chatValidator.validate(
              finalResponse.content,
              currentMode,
              message
            );
            if (!validation.isValid) {
              setAnomalyCount(prev => prev + 1);
            }

            // ✨ v24.2.1: Use ref
            onResponseRef.current?.(finalResponse);
            completed = true;
            return finalResponse;
          } catch (err) {
            const error =
              err instanceof Error ? err : new Error('Unknown AI stream error');
            console.error('❌ USE CHAT CORE: Stream error', error);
            // ✨ v24.2.1: Use ref
            onErrorRef.current?.(error);
            throw error;
          } finally {
            if (!completed && typeof baseStream.return === 'function') {
              try {
                await baseStream.return(undefined as unknown as ChatEngineResponse);
              } catch (cleanupError) {
                console.warn('⚠️ USE CHAT CORE: Stream cleanup failed', cleanupError);
              }
            }
          }
        })();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown AI stream error');
        console.error('❌ USE CHAT CORE: Failed to start stream', error);
        // ✨ v24.2.1: Use ref
        onErrorRef.current?.(error);
        throw error;
      }
    },
    [currentMode, currentProvider] // ✨ v24.2.1: Removed unstable 'options' from deps
  );

  /**
   * Change provider
   */
  const setProvider = useCallback((provider: 'auto' | 'gemini' | 'ollama' | 'local') => {
    console.log(`🔌 USE CHAT CORE: Provider change → ${provider}`);
    setCurrentProvider(provider);
    chatEngine.setProvider(provider);
  }, []);

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
    currentProvider: lastResponseProvider,
    anomalyCount,
    generate,
    stream,
    setMode,
    setProvider,
    validateResponse,
  };
}
