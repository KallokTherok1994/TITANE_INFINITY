/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — USE CHAT STREAMING (Gestion streaming isolée)
 *   Hook isolé: Streaming temps réel uniquement
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { chatEngine, type ChatMode } from '../services/ai';
import type { AIMessage } from '../services/ai/types';

export interface UseChatStreamingOptions {
  mode?: ChatMode;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export interface UseChatStreamingReturn {
  isStreaming: boolean;
  streamedContent: string;
  streamProgress: number; // 0-100
  startStream: (message: string, history: AIMessage[]) => Promise<void>;
  stopStream: () => void;
}

/**
 * Hook streaming isolé
 * - Gestion streaming temps réel
 * - Progress tracking
 * - Abort control
 * - 0 UI, 0 state messages
 */
export function useChatStreaming(
  options: UseChatStreamingOptions = {}
): UseChatStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [streamProgress, setStreamProgress] = useState(0);
  const abortRef = useRef(false);

  /**
   * Start streaming
   */
  const startStream = useCallback(
    async (message: string, history: AIMessage[]) => {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  USE CHAT STREAMING: Start                                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝');

      setIsStreaming(true);
      setStreamedContent('');
      setStreamProgress(0);
      abortRef.current = false;

      try {
        let fullContent = '';
        let chunkCount = 0;

        // Configure mode
        if (options.mode) {
          chatEngine.setMode(options.mode);
        }

        // Stream via chatEngine
        const stream = chatEngine.stream(message, history);

        for await (const chunk of stream) {
          // Check abort
          if (abortRef.current) {
            console.log('⚠️ Streaming aborted by user');
            break;
          }

          fullContent += chunk;
          chunkCount++;

          // Update progress (estimation: 1 chunk = ~10 chars, max 500 chars)
          const estimatedProgress = Math.min((fullContent.length / 500) * 100, 95);
          setStreamProgress(estimatedProgress);

          setStreamedContent(fullContent);

          // Callback chunk
          options.onChunk?.(chunk);

          console.log(`📦 Chunk ${chunkCount}: +${chunk.length} chars (total: ${fullContent.length})`);
        }

        setStreamProgress(100);
        console.log(`✅ Streaming complete (${chunkCount} chunks, ${fullContent.length} chars)`);

        // Callback complete
        options.onComplete?.(fullContent);

        console.log('╚════════════════════════════════════════════════════════════╝\n');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Streaming error');
        console.error('❌ USE CHAT STREAMING: Error', error);

        // Callback error
        options.onError?.(error);

        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [options.mode, options.onChunk, options.onComplete, options.onError]
  );

  /**
   * Stop streaming
   */
  const stopStream = useCallback(() => {
    console.log('🛑 USE CHAT STREAMING: Stop requested');
    abortRef.current = true;
  }, []);

  return {
    isStreaming,
    streamedContent,
    streamProgress,
    startStream,
    stopStream,
  };
}
