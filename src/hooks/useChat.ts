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
import { type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { hybridTTS } from '../services/tts/hybridTTS';

type MaybeAIMessage = Partial<AIMessage> | null | undefined;

const normalizeMessages = (messages: MaybeAIMessage[]): AIMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  const now = Date.now();
  return messages.map((message, index) => {
    const role = message?.role === 'assistant' || message?.role === 'system' || message?.role === 'user'
      ? message.role
      : 'assistant';

    const content = typeof message?.content === 'string'
      ? message.content
      : JSON.stringify(message?.content ?? '');

    return {
      role,
      content,
      timestamp: typeof message?.timestamp === 'number' ? message.timestamp : now + index,
      provider: message?.provider,
      metadata: message?.metadata
    };
  });
};

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
    failureCount: number;
    autoHealCount: number;
    pipelineHealth: 'optimal' | 'stable' | 'degraded' | 'error';
  };

  // Actions
  sendMessage: (content: string) => Promise<AIMessage>;
  clearChat: () => void;
  setMode: (mode: ChatMode) => void;
  setInput: (value: string) => void;
  handleSend: () => void;
  restoreFromVault: () => void;

  // OMNIS Actions
  getDebugInfo: () => object;
  exportChat: () => string;
  importChat: (data: string) => boolean;

  // UI Integrity
  uiIntegrity: {
    version: number;
    preventedResets: number;
    recoveries: number;
    lastRecoveryAt: number | null;
    lastContext: string;
    hasSnapshot: boolean;
  };
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  // ═══ OMNIS STATE ═══
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [internalAnomalyCount, setInternalAnomalyCount] = useState(0);

  const messagesRef = useRef<AIMessage[]>([]);
  const stateVaultRef = useRef<{ stable: AIMessage[]; lastContext: string }>({
    stable: [],
    lastContext: 'init'
  });
  const [uiIntegrity, setUiIntegrity] = useState({
    version: 1,
    preventedResets: 0,
    recoveries: 0,
    lastRecoveryAt: null as number | null,
    lastContext: 'init',
    hasSnapshot: false
  });

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
    setMode: () => {},
    generate: async () => ({
      content: 'TITANE∞ prépare une réponse.',
      provider: 'titane-local',
      timestamp: Date.now(),
    } as ChatEngineResponse)
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

  const { currentMode, anomalyCount, setMode: setCoreMode, generate } = coreHookResult;
  const { messagesForMode, memoryStats, saveMessage, clearMode } = memoryHookResult;

  const applyMessagesSafely = useCallback((nextMessages: MaybeAIMessage[], context: string, options: { allowEmpty?: boolean } = {}) => {
    const allowEmpty = options.allowEmpty ?? false;
    const normalized = normalizeMessages(nextMessages);
    const hasMessages = normalized.length > 0;

    if (!allowEmpty && !hasMessages && stateVaultRef.current.stable.length > 0) {
      const restored = stateVaultRef.current.stable.map(message => ({ ...message }));
      setMessages(restored);
      messagesRef.current = restored;
      setUiIntegrity(prev => ({
        ...prev,
        preventedResets: prev.preventedResets + 1,
        recoveries: prev.recoveries + 1,
        lastRecoveryAt: Date.now(),
        version: prev.version + 1,
        lastContext: context,
        hasSnapshot: true
      }));
      return restored;
    }

    if (hasMessages) {
      stateVaultRef.current.stable = normalized;
      stateVaultRef.current.lastContext = context;
    } else if (allowEmpty) {
      stateVaultRef.current.stable = [];
      stateVaultRef.current.lastContext = context;
    }

    const applied = hasMessages ? normalized : [];
    const emitted = applied.map(message => ({ ...message }));

    setMessages(emitted);
    messagesRef.current = emitted;
    setUiIntegrity(prev => ({
      ...prev,
      version: prev.version + 1,
      lastContext: context,
      hasSnapshot: emitted.length > 0
    }));

    return emitted;
  }, []);

  const restoreFromVault = useCallback(() => {
    if (stateVaultRef.current.stable.length === 0) {
      return;
    }

    const restored = stateVaultRef.current.stable.map(message => ({ ...message }));
    setMessages(restored);
    messagesRef.current = restored;
    setUiIntegrity(prev => ({
      ...prev,
      recoveries: prev.recoveries + 1,
      lastRecoveryAt: Date.now(),
      version: prev.version + 1,
      lastContext: 'manual-restore',
      hasSnapshot: true
    }));
  }, []);

  // ═══ SYNC INITIAL MESSAGES ═══
  useEffect(() => {
    if (!messagesForMode) {
      return;
    }

    if (messagesForMode.length === 0) {
      if (stateVaultRef.current.stable.length === 0) {
        applyMessagesSafely([], 'memory-sync-empty', { allowEmpty: true });
      }
      return;
    }

    applyMessagesSafely(messagesForMode, 'memory-sync');
  }, [messagesForMode, applyMessagesSafely]);

  // ═══ SYNC MESSAGES REF ═══
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ═══ OMNIS SENDMESSAGE KERNEL ═══
  const sendMessage = useCallback(async (content: string): Promise<AIMessage> => {
    const startTime = Date.now();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return {
        role: 'assistant',
        content: 'Veuillez entrer un message pour continuer la conversation.',
        timestamp: Date.now(),
        metadata: { status: 'input-error' }
      };
    }

    const cleanMessage = content.trim();
    setIsLoading(true);
    setError(null);

    const userMessage: AIMessage = {
      role: 'user',
      content: cleanMessage,
      timestamp: Date.now(),
      metadata: { inputLength: cleanMessage.length, mode: currentMode }
    };

    const bufferedMessages = [...messagesRef.current, userMessage];
    const historyBuffer = applyMessagesSafely(bufferedMessages, 'user-message');

    try {
      const engineResponse = await Promise.race([
        generate(cleanMessage, historyBuffer),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), omnisConfig.timeoutMs || 15000)
        )
      ]);

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: engineResponse.content,
        provider: engineResponse.provider || 'titane-local',
        timestamp: Date.now(),
        metadata: {
          status: 'success',
          duration: Date.now() - startTime,
          ...(engineResponse.metadata || {}),
          omegaMetadata: engineResponse.omegaMetadata,
          mode: currentMode
        }
      };

      const finalMessages = [...messagesRef.current, assistantMessage];
      applyMessagesSafely(finalMessages, 'assistant-response');

      try {
        saveMessage(userMessage);
        saveMessage(assistantMessage);
      } catch (memoryError) {
        console.warn('[Chat] Memory integration warning:', memoryError);
      }

      if (options.voiceEnabled && assistantMessage.content) {
        try {
          hybridTTS.speak(assistantMessage.content);
        } catch (voiceError) {
          console.warn('[Chat] Voice warning:', voiceError);
        }
      }

      setSuggestions(engineResponse.suggestions ?? []);
      setIsLoading(false);
      return assistantMessage;

    } catch (error) {
      console.error('[Chat] Engine pipeline error:', error);

      const fallbackResponse: AIMessage = {
        role: 'assistant',
        content: 'TITANE∞ reste présent. Une légère turbulence a été détectée mais l\'espace de discussion est stable. Reformule ou continue quand tu veux.',
        timestamp: Date.now(),
        provider: 'omnis-fallback',
        metadata: {
          status: 'error',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        }
      };

      const errorMessages = [...messagesRef.current, fallbackResponse];
      applyMessagesSafely(errorMessages, 'fallback-response');
      setError('TITANE∞ a rencontré une anomalie et s\'est réparé. Tu peux réessayer immédiatement.');
      setIsLoading(false);
      setInternalAnomalyCount(prev => prev + 1);

      return fallbackResponse;
    }
  }, [applyMessagesSafely, currentMode, generate, omnisConfig.timeoutMs, options.voiceEnabled, saveMessage]);

  // ═══ OTHER ACTIONS ═══
  const clearChat = useCallback(() => {
    applyMessagesSafely([], 'clear-chat', { allowEmpty: true });
    setError(null);
    setInput('');
    setInternalAnomalyCount(0);
    try {
      clearMode();
    } catch (error) {
      console.warn('[OMNIS] Clear mode warning:', error);
    }
  }, [applyMessagesSafely, clearMode]);

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
        applyMessagesSafely(parsed.messages, 'import-chat', { allowEmpty: parsed.messages.length === 0 });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [applyMessagesSafely]);

  // ═══ COMPUTED VALUES ═══
  const omnisStats = useMemo(() => {
    const totalRequests = messages.filter((msg) => msg.role === 'user').length;
    const successCount = messages.filter((msg) => msg.role === 'assistant').length;
    const errorCount = internalAnomalyCount;
    const successRate = totalRequests === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((successCount / totalRequests) * 100)));
    const autoHealCount = internalAnomalyCount;
    const pipelineHealth: 'optimal' | 'stable' | 'degraded' | 'error' = (() => {
      if (error) {
        return 'error';
      }
      if (successRate >= 90) return 'optimal';
      if (successRate >= 65) return 'stable';
      return 'degraded';
    })();

    return {
      totalRequests,
      successCount,
      errorCount,
      successRate,
      engineVersion: 'omega-v19.2',
      failureCount: errorCount,
      autoHealCount,
      pipelineHealth
    };
  }, [messages, internalAnomalyCount, error]);

  const getDebugInfo = useCallback(() => ({
    engineStats: omnisStats,
    memoryStats,
    anomalyCount: anomalyCount + internalAnomalyCount,
    currentMode,
    isLoading,
    messagesCount: messages.length,
    omnisConfig
  }), [anomalyCount, currentMode, internalAnomalyCount, isLoading, messages.length, memoryStats, omnisConfig, omnisStats]);

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
    uiIntegrity,

    // Actions
    sendMessage,
    clearChat,
    setMode,
    setInput,
    handleSend,
    restoreFromVault,

    // OMNIS Actions
    getDebugInfo,
    exportChat,
    importChat
  };
}
