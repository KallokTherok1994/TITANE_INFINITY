/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — USE CHAT STREAMING (Streaming Tauri Réel)
 *   Hook isolé: Streaming temps réel via tauriClient
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { tauriClient } from '../services/tauriClient';
import type { ChatRequest, StreamCallbacks } from '../services/tauriClient';
import type { ChatMode } from '../services/ai';
import type { AIMessage } from '../services/ai/types';

export interface UseChatStreamingOptions {
  mode?: ChatMode;
  provider?: 'auto' | 'gemini' | 'ollama' | 'local';
  onChunk?: (chunk: string) => void;
  onComplete?: (data: { content: string; provider: string; latency_ms: number }) => void;
  onError?: (error: Error) => void;
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
 * Hook streaming isolé v14
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

  const startStream = useCallback(
    async (message: string, history: AIMessage[] = []) => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  USE CHAT STREAMING v14: Tauri Real Stream                ║');
      console.log('╚════════════════════════════════════════════════════════════╝');

      setIsStreaming(true);
      setStreamedContent('');
      setStreamProgress(0);
      setCurrentProvider(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const provider = options.provider || 'auto';
        const timeout = provider === 'gemini' ? 60000
                      : provider === 'ollama' ? 45000
                      : provider === 'local' ? 15000
                      : 60000;

        console.log(`🎯 Provider: ${provider} (timeout: ${timeout}ms)`);

        const request: ChatRequest = {
          message: message.trim(),
          provider,
          streaming: true,
          system_prompt: `Mode: ${options.mode || 'default'}`,
        };

        let fullContent = '';
        let chunkCount = 0;

        const callbacks: StreamCallbacks = {
          onChunk: (chunk: string) => {
            fullContent += chunk;
            chunkCount++;

            const estimatedProgress = Math.min((fullContent.length / 800) * 100, 95);
            setStreamProgress(estimatedProgress);
            setStreamedContent(fullContent);

            options.onChunk?.(chunk);
            console.log(`📦 Chunk ${chunkCount}: +${chunk.length} chars (total: ${fullContent.length})`);
          },

          onComplete: (data) => {
            setStreamProgress(100);
            setCurrentProvider(data.provider);

            console.log(`✅ Stream complete: ${chunkCount} chunks, ${fullContent.length} chars`);
            console.log(`   Provider: ${data.provider}, Latency: ${data.latency_ms}ms`);

            options.onComplete?.(data);
          },

          onError: (error) => {
            console.error('❌ Streaming error:', error);
            options.onError?.(new Error(error.message));
          },
        };

        await tauriClient.chatStreamMessage(request, callbacks, {
          timeout,
          abortSignal: controller.signal,
        });

      } catch (error) {
        console.error('❌ Start stream error:', error);
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const stopStream = useCallback(() => {
    console.log('🛑 Stopping stream...');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
