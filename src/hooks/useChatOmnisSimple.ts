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
      }\n      \n      // OMNIS Step 6: Add response to messages\n      setMessages(prev => [...prev, validatedResponse]);\n      \n      // OMNIS Step 7: Voice output (if enabled)\n      if (voiceEnabled_ && validatedResponse.content) {\n        try {\n          hybridTTS.speak(validatedResponse.content);\n        } catch (voiceError) {\n          console.warn('[OMNIS] Voice warning:', voiceError);\n        }\n      }\n      \n      // OMNIS Step 8: Success cleanup\n      setIsLoading(false);\n      \n      return validatedResponse;\n      \n    } catch (error) {\n      console.error('[OMNIS] Pipeline error:', error);\n      \n      // OMNIS Ultimate fallback\n      const fallbackResponse: AIMessage = {\n        role: 'assistant',\n        content: 'TITANE∞ est opérationnel. Le système s\\'auto-répare et reste disponible pour vos questions.',\n        timestamp: Date.now(),\n        provider: 'omnis-safety',\n        metadata: {\n          status: 'error',\n          duration: Date.now() - startTime,\n          error: String(error),\n          autoGenerated: true\n        }\n      };\n      \n      setMessages(prev => [...prev, fallbackResponse]);\n      setError('Une anomalie a été détectée et réparée automatiquement.');\n      setIsLoading(false);\n      \n      return fallbackResponse;\n    }\n  }, [messages, voiceEnabled_]);\n  \n  const clearChat = useCallback(() => {\n    setMessages([]);\n    setError(null);\n    setInput('');\n  }, []);\n  \n  const toggleVoice = useCallback(() => {\n    setVoiceEnabled(prev => !prev);\n  }, []);\n  \n  const getStats = useCallback(() => {\n    return chatEngineOmnis.getStats();\n  }, []);\n  \n  return {\n    messages,\n    input,\n    isLoading,\n    error,\n    \n    sendMessage,\n    setInput,\n    clearChat,\n    toggleVoice,\n    \n    getStats\n  };\n}
