/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — useStreamingChat Hook
 *   Hook React pour la gestion du streaming de réponses IA
 *   Intégration minimale Phase 1
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useRef, useState } from 'react';
import {
  chatEngineCommands,
  type OmegaGenerateArgs,
  type OmegaResponse,
  type StreamChunkPayload,
} from '@/services/tauri/chatEngine.commands';
import type { UnlistenFn } from '@tauri-apps/api/event';

export interface StreamingState {
  isStreaming: boolean;
  content: string;
  error: string | null;
  messageId: string | null;
  latencyMs: number | null;
  metadata: OmegaResponse['metadata'] | null;
}

export interface UseStreamingChatReturn {
  state: StreamingState;
  sendMessage: (args: OmegaGenerateArgs) => Promise<OmegaResponse | null>;
  cancelStream: () => void;
  resetState: () => void;
}

const initialState: StreamingState = {
  isStreaming: false,
  content: '',
  error: null,
  messageId: null,
  latencyMs: null,
  metadata: null,
};

/**
 * Hook pour gérer le chat avec streaming ou fallback non-streaming
 *
 * Phase 1 v20.0 : Utilise le pipeline OMEGA existant avec affichage progressif simulé
 * Le vrai streaming sera activé quand le backend Rust émettra les events
 */
export function useStreamingChat(): UseStreamingChatReturn {
  const [state, setState] = useState<StreamingState>(initialState);
  const abortRef = useRef(false);
  const unlistenChunkRef = useRef<UnlistenFn | null>(null);
  const unlistenDoneRef = useRef<UnlistenFn | null>(null);

  const resetState = useCallback(() => {
    setState(initialState);
    abortRef.current = false;
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: 'Streaming annulé par l\'utilisateur',
    }));

    // Cleanup listeners
    if (unlistenChunkRef.current) {
      unlistenChunkRef.current();
      unlistenChunkRef.current = null;
    }
    if (unlistenDoneRef.current) {
      unlistenDoneRef.current();
      unlistenDoneRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (args: OmegaGenerateArgs): Promise<OmegaResponse | null> => {
    // Reset state
    abortRef.current = false;
    setState({
      isStreaming: true,
      content: '',
      error: null,
      messageId: null,
      latencyMs: null,
      metadata: null,
    });

    const startTime = performance.now();

    try {
      // Tentative d'utiliser le vrai streaming si disponible
      const useRealStreaming = false; // TODO: Activer quand backend prêt

      if (useRealStreaming) {
        // Setup streaming listeners
        unlistenChunkRef.current = await chatEngineCommands.onStreamChunk(
          (chunk: StreamChunkPayload) => {
            if (abortRef.current) return;

            setState(prev => ({
              ...prev,
              content: prev.content + chunk.content,
              messageId: chunk.messageId,
            }));
          }
        );

        unlistenDoneRef.current = await chatEngineCommands.onStreamDone(
          (chunk: StreamChunkPayload) => {
            const latency = Math.round(performance.now() - startTime);
            setState(prev => ({
              ...prev,
              isStreaming: false,
              latencyMs: latency,
            }));

            // Cleanup
            if (unlistenChunkRef.current) {
              unlistenChunkRef.current();
              unlistenChunkRef.current = null;
            }
            if (unlistenDoneRef.current) {
              unlistenDoneRef.current();
              unlistenDoneRef.current = null;
            }
          }
        );

        // Start streaming
        await chatEngineCommands.streamResponse({
          userMessage: args.message,
          conversationId: args.conversationId,
          enableStreaming: true,
        });

        // Le state sera mis à jour via les listeners
        return null;
      }

      // Fallback: Non-streaming avec affichage progressif simulé
      const response = await chatEngineCommands.generate(args);

      if (abortRef.current) {
        return null;
      }

      // Affichage progressif simulé (typewriter effect)
      const fullContent = response.content;
      const chunkSize = 3; // Caractères par chunk
      const delayMs = 10; // Délai entre chunks

      let displayedContent = '';

      for (let i = 0; i < fullContent.length && !abortRef.current; i += chunkSize) {
        displayedContent = fullContent.slice(0, i + chunkSize);
        setState(prev => ({
          ...prev,
          content: displayedContent,
          messageId: response.messageId,
        }));

        // Petit délai pour l'effet de streaming
        if (i + chunkSize < fullContent.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      // Finaliser
      const latency = response.latencyMs ?? Math.round(performance.now() - startTime);
      setState({
        isStreaming: false,
        content: fullContent,
        error: null,
        messageId: response.messageId,
        latencyMs: latency,
        metadata: response.metadata ?? null,
      });

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[useStreamingChat] Erreur:', errorMessage);

      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }));

      return null;
    }
  }, []);

  return {
    state,
    sendMessage,
    cancelStream,
    resetState,
  };
}

export default useStreamingChat;
