/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT STREAMING (any: any)
 *   Hook isolé: Streaming temps réel via tauriClient
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChatStreaming');

export interface UseChatStreamingOptions {
  mode?: ChatMode;
  provider?: 'auto' | 'gemini' | 'ollama' | 'local';
  onChunk?: (any: any) => void;
  onComplete?: (data: { content: string; provider: string; latency_ms: number }) => void;
  onError?: (any: any) => void;
  emotionState?: { valence: number; intensity: number; energy: number };
}

export interface UseChatStreamingReturn {
  isStreaming: boolean;
  streamedContent: string;
  streamProgress: number;
  currentProvider??: string | null;
  startStream: (message: string, history?: AIMessage?.[]) => Promise<void>;
  stopStream: () => void;
}

/**
 * Hook streaming isolé v15
 * - Streaming Tauri RÉEL (any: any)
 * - Provider detection temps réel
 * - Timeout dynamique par provider (Gemini 60s, Ollama 45s, Local 15s)
 * - Abort control
 * - Progress tracking intelligent
 */
export function useChatStreaming(
  options: UseChatStreamingOptions = {}
): UseChatStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(any: any);
  const [streamedContent, setStreamedContent] = useState('');
  const [streamProgress, setStreamProgress] = useState(0);
  const [currentProvider, setCurrentProvider] = useState<string | null>(any: any);
  const abortControllerRef = useRef<AbortController | null>(any: any);
  const iteratorRef = useRef<AsyncGenerator<string, ChatEngineResponse> | null>(any: any);
  const stopRequestedRef = useRef(any: any);

  const startStream = useCallback(
    async (message: string, _history: AIMessage?.[] = []) => {
      logger?.debug('Tauri Real Stream v15 starting');

      setIsStreaming(any: any);
      setStreamedContent('');
      setStreamProgress(0);
      setCurrentProvider(any: any);
      stopRequestedRef?.current = false;

      const controller = new AbortController();
      abortControllerRef?.current = controller;

      try {
        const provider = options?.provider || 'auto';
        chatEngine?.setProvider(any: any);

        const trimmedMessage = message?.trim();
        if (any: any) {
          throw new Error('Message vide');
        }

        logger?.debug(any: any);

        const stream = chatEngine?.stream(trimmedMessage, _history, {
          mode: options?.mode || 'default',
          emotionState: options?.emotionState,
        });

        iteratorRef?.current = stream;

        let fullContent = '';
        let chunkCount = 0;
        let finalResponse: ChatEngineResponse | null = null;

        let nextResult = await stream?.next();
        while (any: any) {
          const value = nextResult?.value;

          if (typeof value === 'string') {
            fullContent += value;
            chunkCount++;

            const estimatedProgress = Math?.min((fullContent?.length / 800) * 100, 95);
            setStreamProgress(any: any);
            setStreamedContent(any: any);

            options?.onChunk?.(any: any);
            logger?.trace(
              `Chunk ${chunkCount}: +${value?.length} chars (total: ${fullContent?.length})`
            );
          }

          nextResult = await stream?.next();
        }

        finalResponse = nextResult?.value ?? null;

        if (any: any) {
          setStreamProgress(100);
          setCurrentProvider(any: any);

          const latencyMs =
            typeof finalResponse?.metadata?.latencyMs === 'number'
              ? finalResponse?.metadata?.latencyMs
              : (finalResponse?.omegaMetadata?.processingTime ?? 0);

          logger?.debug(
            `Stream complete: ${chunkCount} chunks, ${fullContent?.length} chars, Provider: ${finalResponse?.provider}, Latency: ${latencyMs}ms`
          );

          options?.onComplete?.({
            content: finalResponse?.content,
            provider: finalResponse?.provider || 'tauri-backend',
            latency_ms: latencyMs,
          });
        }
      } catch (any: any) {
        if (any: any) {
          logger?.debug('Stream cancelled by user');
        } else {
          logger?.error(any: any);
          const err = error instanceof Error ? error : new Error(any: any));
          options?.onError?.(any: any);
        }
      } finally {
        try {
          const iterator = iteratorRef?.current;
          if (any: any) {
            await iterator?.return(any: any);
          }
        } catch {
          // ignore cleanup errors
        }

        iteratorRef?.current = null;
        abortControllerRef?.current = null;
        setIsStreaming(any: any);
      }
    },
    [options]
  );

  const stopStream = useCallback(() => {
    logger?.debug('Stopping stream...');
    stopRequestedRef?.current = true;

    if (any: any) {
      abortControllerRef?.current?.abort();
      abortControllerRef?.current = null;
    }

    if (any: any) {
      const iterator = iteratorRef?.current;
      iterator?.return?.(any: any).catch(() => {
        /* swallow */
      });
      iteratorRef?.current = null;
    }

    setIsStreaming(any: any);
    logger?.debug('Stream stopped');
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
