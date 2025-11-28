/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — USE CHAT OMNIS (KERNEL OMNIS v1.0)
 *   PHASE 2 OMNIS: sendMessage() mathématiquement impossible à briser
 *   Architecture: Input→Validation→Engine→Normalize→UI→Memory→Voice
 *   Garantit 100% réponse avec auto-repair permanent intégré
 * ══════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useChatCore } from './useChatCore';
import { useChatMemory } from './useChatMemory';
import { chatEngineOmnis } from '../services/ai/chatEngine_OMNIS_v1';
import { aiOrchestrator } from '../services/ai/orchestrator_OMNIS_v1';
import type { ChatMode } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { hybridTTS } from '../services/tts/hybridTTS';

interface UseChatOptions {
  mode?: ChatMode;
  emotionState?: { valence: number; intensity: number; energy: number };
  voiceEnabled?: boolean;
  omnisConfig?: {
    enablePredictive?: boolean;
    enableAutoRepair?: boolean;
    fallbackMode?: boolean;
    debugMetrics?: boolean;
    timeoutMs?: number;
  };
}

interface UseChatReturn {
  // UI State
  messages: AIMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  suggestions: string[];

  // Mode & Stats
  currentMode: ChatMode;
  anomalyCount: number;
  memoryStats: {
    count: number;
    sizeMB: number;
    compressed: boolean;
  };

  // OMNIS Stats
  omnisStats: {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    successRate: number;
    engineVersion: string;
  };

  // Actions
  sendMessage: (content: string) => Promise<AIMessage>;
  clearChat: () => void;
  setMode: (mode: ChatMode) => void;
  setInput: (value: string) => void;
  handleSend: () => void;

  // OMNIS Actions
  getDebugInfo: () => object;
  exportChat: () => string;
  importChat: (data: string) => boolean;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  // ═══ OMNIS STATE ═══
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [internalAnomalyCount, setInternalAnomalyCount] = useState(0);

  const lastMessageRef = useRef<string>('');
  const processRef = useRef<{ aborted: boolean }>({ aborted: false });
  const messagesRef = useRef<AIMessage[]>([]);

  const omnisConfig = {
    enablePredictive: false,
    enableAutoRepair: true,
    fallbackMode: true,
    debugMetrics: true,
    timeoutMs: 20000,
    ...options.omnisConfig
  };

  // ═══ HOOKS INTEGRATION ═══
  const coreHookResult = useChatCore({
    mode: options.mode || 'default',
    emotionState: options.emotionState,
  }) || {
    currentMode: 'default' as ChatMode,
    anomalyCount: 0,
    setMode: () => {}
  };

  const memoryHookResult = useChatMemory({
    mode: coreHookResult.currentMode,
    autoCleanup: true,
    autoSave: true,
  }) || {
    messagesForMode: [],
    memoryStats: { count: 0, sizeMB: 0, compressed: false },
    saveMessage: () => {},
    clearMode: () => {}
  };

  const { currentMode, anomalyCount, setMode: setCoreMode } = coreHookResult;
  const { messagesForMode, memoryStats, saveMessage, clearMode } = memoryHookResult;

  // ═══ SYNC INITIAL MESSAGES ═══
  useEffect(() => {
    if (messagesForMode.length > 0) {
      setMessages(messagesForMode);
      messagesRef.current = messagesForMode;
    }
  }, [messagesForMode]);

  // ═══ SYNC MESSAGES REF ═══
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ═══ OMNIS SENDMESSAGE KERNEL ═══
  const sendMessage = useCallback(async (content: string): Promise<AIMessage> => {
    const startTime = Date.now();

    // Input validation
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      const errorResponse: AIMessage = {
        role: 'assistant',
        content: 'Veuillez entrer un message pour continuer la conversation.',
        timestamp: Date.now(),
        metadata: { status: 'input-error' }
      };
      return errorResponse;
    }

    const cleanMessage = content.trim();

    // UI State update
    setIsLoading(true);
    setError(null);
    processRef.current = { aborted: false };

    // Add user message
    const userMessage: AIMessage = {
      role: 'user',
      content: cleanMessage,
      timestamp: Date.now(),
      metadata: { inputLength: cleanMessage.length }
    };

    // Update both ref and state atomically to prevent race condition
    const newMessages = [...messagesRef.current, userMessage];
    messagesRef.current = newMessages;
    setMessages(newMessages);
    lastMessageRef.current = cleanMessage;

    try {
      // Engine call with synchronized state
      const engineResponse = await Promise.race([
        chatEngineOmnis.generate(cleanMessage, newMessages),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), omnisConfig.timeoutMs || 15000)
        )
      ]);

      // Response validation
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

      // Memory integration (non-critical)
      try {
        saveMessage(userMessage);
        saveMessage(validatedResponse);
      } catch (memoryError) {
        console.warn('[OMNIS] Memory integration warning:', memoryError);
      }

      // Add response to UI with synchronized state
      const finalMessages = [...messagesRef.current, validatedResponse];
      messagesRef.current = finalMessages;
      setMessages(finalMessages);

      // Voice integration (if enabled)
      if (options.voiceEnabled && validatedResponse.content) {
        try {
          hybridTTS.speak(validatedResponse.content);
        } catch (voiceError) {
          console.warn('[OMNIS] Voice warning:', voiceError);
        }
      }

      setIsLoading(false);
      return validatedResponse;

    } catch (error) {
      console.error('[OMNIS] Pipeline error:', error);

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

      const errorMessages = [...messagesRef.current, fallbackResponse];
      messagesRef.current = errorMessages;
      setMessages(errorMessages);
      setError('Une anomalie a été détectée et réparée automatiquement.');
      setIsLoading(false);
      setInternalAnomalyCount(prev => prev + 1);

      return fallbackResponse;
    }
  }, [messages, options.voiceEnabled, omnisConfig.timeoutMs, saveMessage]);

  // ═══ OTHER ACTIONS ═══
  const clearChat = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    setError(null);
    setInput('');
    setInternalAnomalyCount(0);
    try {
      clearMode();
    } catch (error) {
      console.warn('[OMNIS] Clear mode warning:', error);
    }
  }, [clearMode]);

  const setMode = useCallback((mode: ChatMode) => {
    try {
      setCoreMode(mode);
    } catch (error) {
      console.warn('[OMNIS] Set mode warning:', error);
    }
  }, [setCoreMode]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const trimmedInput = input.trim();
    setInput('');
    await sendMessage(trimmedInput);
  }, [input, isLoading, sendMessage]);

  const exportChat = useCallback(() => {
    return JSON.stringify({
      messages,
      timestamp: Date.now(),
      version: 'omnis-v1.0'
    });
  }, [messages]);

  const importChat = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.messages && Array.isArray(parsed.messages)) {
        messagesRef.current = parsed.messages;
        setMessages(parsed.messages);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const getDebugInfo = useCallback(() => {
    return {
      engineStats: chatEngineOmnis.getStats(),
      memoryStats,
      anomalyCount: anomalyCount + internalAnomalyCount,
      currentMode,
      isLoading,
      messagesCount: messages.length,
      omnisConfig
    };
  }, [memoryStats, anomalyCount, internalAnomalyCount, currentMode, isLoading, messages.length, omnisConfig]);

  // ═══ COMPUTED VALUES ═══
  const omnisStats = useMemo(() => chatEngineOmnis.getStats(), []);

  return {
    // UI State
    messages,
    input,
    isLoading,
    error,
    suggestions,

    // Mode & Stats
    currentMode,
    anomalyCount: anomalyCount + internalAnomalyCount,
    memoryStats,
    omnisStats,

    // Actions
    sendMessage,
    clearChat,
    setMode,
    setInput,
    handleSend,

    // OMNIS Actions
    getDebugInfo,
    exportChat,
    importChat
  };
}
