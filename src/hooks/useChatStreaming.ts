/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT STREAMING (Streaming Tauri Réel)
 *   Hook isolé: Streaming temps réel via tauriClient
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';

export interface UseChatStreamingOptions {
  mode?: ChatMode;
  provider?: 'auto' | 'gemini' | 'ollama' | 'local';
  onChunk?: (chunk: string) => void;
  onComplete?: (data: { content: string; provider: string; latency_ms: number }) => void;
  onError?: (error: Error) => void;
  emotionState?: { valence: number; intensity: number; energy: number };
}

export interface UseChatStreamingReturn {
  isStreaming: boolean;
  streamedContent: string;
  streamProgress: number;
  currentProvider: string | null;
  startStream: (message: string, history?: AIMessage[]) => Promise<void>;
  stopStream: () => void;
}

/**
 * Hook streaming isolé v15
 * - Streaming Tauri RÉEL (événements chunk par chunk)
 * - Provider detection temps réel
 * - Timeout dynamique par provider (Gemini 60s, Ollama 45s, Local 15s)
 * - Abort control
 * - Progress tracking intelligent
 */
export function useChatStreaming(
  options: UseChatStreamingOptions = {}
): UseChatStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [streamProgress, setStreamProgress] = useState(0);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const iteratorRef = useRef<AsyncGenerator<string, ChatEngineResponse> | null>(null);
  const stopRequestedRef = useRef(false);

  const startStream = useCallback(
    async (message: string, _history: AIMessage[] = []) => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  USE CHAT STREAMING v15: Tauri Real Stream                ║');
      console.log('╚════════════════════════════════════════════════════════════╝');

      setIsStreaming(true);
      setStreamedContent('');
      setStreamProgress(0);
      setCurrentProvider(null);
      stopRequestedRef.current = false;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const provider = options.provider || 'auto';
        chatEngine.setProvider(provider);

        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
          throw new Error('Message vide');
        }

        console.log(`🎯 Provider: ${provider} (chatEngine stream)`);

        const stream = chatEngine.stream(trimmedMessage, _history, {
          mode: options.mode || 'default',
          emotionState: options.emotionState,
        });

        iteratorRef.current = stream;

        let fullContent = '';
        let chunkCount = 0;
        let finalResponse: ChatEngineResponse | null = null;

        let nextResult = await stream.next();
        while (!nextResult.done) {
          const value = nextResult.value;

          if (typeof value === 'string') {
            fullContent += value;
            chunkCount++;

            const estimatedProgress = Math.min((fullContent.length / 800) * 100, 95);
            setStreamProgress(estimatedProgress);
            setStreamedContent(fullContent);

            options.onChunk?.(value);
            console.log(`📦 Chunk ${chunkCount}: +${value.length} chars (total: ${fullContent.length})`);
          }

          nextResult = await stream.next();
        }

        finalResponse = nextResult.value ?? null;

        if (finalResponse) {
          setStreamProgress(100);
          setCurrentProvider(finalResponse.provider || null);

          const latencyMs = typeof finalResponse.metadata?.latencyMs === 'number'
            ? finalResponse.metadata.latencyMs
            : finalResponse.omegaMetadata?.processingTime ?? 0;

          console.log(`✅ Stream complete: ${chunkCount} chunks, ${fullContent.length} chars`);
          console.log(`   Provider: ${finalResponse.provider}, Latency: ${latencyMs}ms`);

          options.onComplete?.({
            content: finalResponse.content,
            provider: finalResponse.provider || 'tauri-backend',
            latency_ms: latencyMs,
          });
        }

      } catch (error) {
        if (stopRequestedRef.current) {
          console.log('🔕 Stream cancelled by user');
        } else {
          console.error('❌ Stream error:', error);
          const err = error instanceof Error ? error : new Error(String(error));
          options.onError?.(err);
        }
      } finally {
        try {
          const iterator = iteratorRef.current;
          if (iterator?.return) {
            await iterator.return(undefined as unknown as ChatEngineResponse);
          }
        } catch {
          // ignore cleanup errors
        }

        iteratorRef.current = null;
        abortControllerRef.current = null;
        setIsStreaming(false);
      }
    },
    [options]
  );

  const stopStream = useCallback(() => {
    console.log('🛑 Stopping stream...');
    stopRequestedRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (iteratorRef.current) {
      const iterator = iteratorRef.current;
      iterator.return?.(undefined as unknown as ChatEngineResponse).catch(() => {
        /* swallow */
      });
      iteratorRef.current = null;
    }

    setIsStreaming(false);
    console.log('✅ Stream stopped');
  }, []);

  return {
    isStreaming,
    streamedContent,
    streamProgress,
    currentProvider,
    startStream,
    stopStream,
  };
}
