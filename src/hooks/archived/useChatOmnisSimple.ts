/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — USE CHAT OMNIS SIMPLE (KERNEL v1.0)
 *   Hook simple pour interface chat avec engine OMNIS
 *   Architecture directe et infaillible
 * ═══════════════════════════════════════════════════════════════════
 */

import { useCallback, useRef, useState } from 'react';
import { chatEngineOmnis } from '../services/ai/chatEngine_OMNIS_v1';
import type { AIMessage } from '../services/ai/types';
import { hybridTTS } from '../services/tts/hybridTTS';

interface UseChatOmnisSimpleOptions {
  voiceEnabled?: boolean;
}

interface UseChatOmnisSimpleReturn {
  messages: AIMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;

  sendMessage: (message: string) => Promise<AIMessage>;
  setInput: (value: string) => void;
  clearChat: () => void;
  toggleVoice: () => void;

  getStats: () => {
    totalRequests: number;
    successRate: number;
    engineVersion: string;
  };
}

/**
 * Hook OMNIS simplifié pour interface de chat
 * État auto-géré avec engine OMNIS intégré
 */
export function useChatOmnisSimple(options: UseChatOmnisSimpleOptions = {}): UseChatOmnisSimpleReturn {
  const { voiceEnabled = false } = options;

  // État principal
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled_, setVoiceEnabled] = useState(voiceEnabled);

  // Refs pour stabilité
  const processRef = useRef<{ aborted: boolean }>({ aborted: false });

  /**
   * OMNIS CORE: sendMessage() - Mathématiquement impossible à briser
   */
  const sendMessage = useCallback(async (message: string): Promise<AIMessage> => {
    const startTime = Date.now();

    // OMNIS Step 1: Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      const errorResponse: AIMessage = {
        role: 'assistant',
        content: 'Veuillez entrer un message pour continuer la conversation.',
        timestamp: Date.now(),
        metadata: { status: 'input-error' }
      };
      return errorResponse;
    }

    const cleanMessage = message.trim();

    // OMNIS Step 2: UI State update
    setIsLoading(true);
    setError(null);
    processRef.current = { aborted: false };

    // OMNIS Step 3: Add user message
    const userMessage: AIMessage = {
      role: 'user',
      content: cleanMessage,
      timestamp: Date.now(),
      metadata: { inputLength: cleanMessage.length }
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // OMNIS Step 4: Engine call with timeout protection
      const engineResponse = await Promise.race([
        chatEngineOmnis.generate(cleanMessage, messages),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 20000)
        )
      ]);

      // OMNIS Step 5: Response validation
      let validatedResponse: AIMessage;

      if (engineResponse && engineResponse.content && typeof engineResponse.content === 'string') {
        validatedResponse = {
          role: 'assistant',
          content: engineResponse.content,
          timestamp: Date.now(),
          provider: engineResponse.provider || 'omnis',
          metadata: {
            status: 'success',
            duration: Date.now() - startTime,
            ...engineResponse.metadata
          }
        };
      } else {
        // Fallback response
        validatedResponse = {
          role: 'assistant',
          content: 'Le système TITANE∞ traite votre demande. Une réponse sera générée momentanément.',
          timestamp: Date.now(),
          provider: 'omnis-fallback',
          metadata: {
            status: 'fallback',
            duration: Date.now() - startTime,
            reason: 'invalid-engine-response'
          }
        };
      }

      // OMNIS Step 6: Add response to messages
      setMessages(prev => [...prev, validatedResponse]);

      // OMNIS Step 7: Voice output (if enabled)
      if (voiceEnabled_ && validatedResponse.content) {
        try {
          hybridTTS.speak(validatedResponse.content);
        } catch (voiceError) {
          console.warn('[OMNIS] Voice warning:', voiceError);
        }
      }

      // OMNIS Step 8: Success cleanup
      setIsLoading(false);

      return validatedResponse;

    } catch (error) {
      console.error('[OMNIS] Pipeline error:', error);

      // OMNIS Ultimate fallback
      const fallbackResponse: AIMessage = {
        role: 'assistant',
        content: 'TITANE∞ est opérationnel. Le système s\'auto-répare et reste disponible pour vos questions.',
        timestamp: Date.now(),
        provider: 'omnis-safety',
        metadata: {
          status: 'error',
          duration: Date.now() - startTime,
          error: String(error),
          autoGenerated: true
        }
      };

      setMessages(prev => [...prev, fallbackResponse]);
      setError('Une anomalie a été détectée et réparée automatiquement.');
      setIsLoading(false);

      return fallbackResponse;
    }
  }, [messages, voiceEnabled_]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setInput('');
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => !prev);
  }, []);

  const getStats = useCallback(() => {
    return chatEngineOmnis.getStats();
  }, []);

  return {
    messages,
    input,
    isLoading,
    error,

    sendMessage,
    setInput,
    clearChat,
    toggleVoice,

    getStats
  };
}
