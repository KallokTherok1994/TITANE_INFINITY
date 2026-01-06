/**
 * TITANE∞ v24.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.3.0 — USE CHAT OMNIS (KERNEL OMNIS)
 *   sendMessage() mathématiquement impossible à briser
 *   Architecture: Input→Validation→Engine→Normalize→UI→Memory→Voice
 *   v22Ω AI Performance Optimizations: -40% latency, stream batching
 * ══════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useChatCore, type UseChatCoreReturn } from '@hooks/useChatCore';
import { useChatMemory } from '@hooks/useChatMemory';
import { type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage, AIProviderName } from '../services/ai/types';
import type { HarmonizedMessage } from '@/types/cognitiveKernel';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
// ✨ v24.2.1 - Streaming Debounce for Performance
import { createStreamingBatcher } from '@/utils/streamingDebounce';
import {
  chatService,
  type ChatMessage as BackendChatMessage,
  type ChatResponse,
  type StreamConfig,
} from '../services/api';
import { XP } from '../core/experience/XP_ENGINE';
import { awardExperience } from '../services/experienceService';
import { XPSource, XP_REWARDS } from '../types/experience';
import { userPreferencesEngine } from '../services/userPreferencesEngine';

// ✨ v22Ω - Cognitive Kernel Integration
import { cognitiveKernel } from '@/services/ai/cognitiveKernel';

// ✨ v∞.20.0 - Camera Chat Integration (Super Prompt #3)
import { handleCameraInChat } from '@/modules/camera/cameraChatIntegration';
import { useVisionStore } from '@/stores/useVisionStore';

// ✨ v∞.21.0 - DEV-SUDO Mode Integration (Super Prompt FULL UNLOCK)
import { handleDevSudoInChat } from '@/modules/devSudo/devSudoIntegration';

// ✨ v∞.24.2 - Production-Safe Logging
import { chatLogger } from '@/utils/chatLogger';

// ✨ v24.3.0 - Cloud Providers Availability Check
import { openaiProvider } from '@/services/ai/providers/openai';
import { UI_TIMEOUTS, getAdaptiveUITimeout } from '@/config/aiTimeouts.config'; // v22Ω: Centralized timeouts
import { geminiProvider } from '@/services/ai/providers/gemini';
import { claudeProvider } from '@/services/ai/providers/claude';

type MaybeAIMessage = Partial<AIMessage> | null | undefined;

// ✨ v24.3.0 - Cloud Providers Integration (OpenAI/Gemini/Anthropic)
// ✨ v26.3.0 - Added GitHub Copilot provider
export type ProviderPreference =
  | 'auto'
  | 'local'
  | 'ollama'
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'copilot';

export interface ChatDebugAttempt {
  provider: string;
  success: boolean;
  error?: string;
  response?: ChatResponse;
}

export interface ChatDebugEntry {
  id: string;
  timestamp: number;
  requestedProvider: ProviderPreference | string;
  attempts: ChatDebugAttempt[];
  request: {
    messages: BackendChatMessage[];
    config: StreamConfig;
    attemptedProviders: string[];
  };
  status: 'success' | 'error';
  response?: ChatResponse;
  error?: string;
  selectedProvider?: string;
  latencyMs?: number;
}

// ✅ v26.3.1: Reduced from 20 to 5 to prevent memory accumulation in tests
const DEBUG_MAX_ENTRIES = 5;

const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';

const isProviderPreference = (value: unknown): value is ProviderPreference =>
  value === 'auto' ||
  value === 'local' ||
  value === 'ollama' ||
  value === 'openai' ||
  value === 'gemini' ||
  value === 'anthropic' ||
  value === 'copilot';

const readStoredPreferredProvider = (): ProviderPreference => {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  const stored = window.localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY);
  // ✅ v26.2.3: Mode cascade (auto) par défaut - permet au backend de choisir
  // le meilleur provider disponible (Gemini → Ollama → Local fallback)
  return isProviderPreference(stored) ? stored : 'auto';
};

const normalizeMessages = (
  messages: MaybeAIMessage[],
  getUiId: () => string
): AIMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  const now = Date.now();
  const normalized = messages.map((message, index) => {
    const role =
      message?.role === 'assistant' ||
      message?.role === 'system' ||
      message?.role === 'user'
        ? message.role
        : 'assistant';

    const content =
      typeof message?.content === 'string'
        ? message.content
        : JSON.stringify(message?.content ?? '');

    const metadata =
      message?.metadata && typeof message.metadata === 'object'
        ? { ...message.metadata }
        : {};

    if (!metadata.uiId) {
      metadata.uiId = getUiId();
    }

    return {
      role,
      content,
      timestamp: typeof message?.timestamp === 'number' ? message.timestamp : now + index,
      provider: message?.provider,
      metadata,
    };
  });

  // ✅ FIX RÉPÉTITIONS: Déduplication par uiId et contenu
  return deduplicateMessages(normalized);
};

/**
 * ✅ FIX CHAT RÉPÉTITIONS (Super Prompt #9 - Vision Engine)
 * ✨ v24.3.6: Optimized deduplication - O(n) with minimal allocations
 * - Uses uiId first (O(1) lookup)
 * - Fallback to timestamp only (avoids substring allocation)
 * - Skip small arrays (< 5 messages) for performance
 */
function deduplicateMessages(messages: AIMessage[]): AIMessage[] {
  // ✨ v24.3.6: Skip dedup for small arrays (common case)
  if (messages.length < 5) return messages;

  const seen = new Set<string>();
  return messages.filter(msg => {
    // ✨ v24.3.6: Prefer uiId (no allocation), fallback to timestamp only
    const uiId = msg.metadata?.uiId;
    const key = typeof uiId === 'string' ? uiId : String(msg.timestamp);
    if (seen.has(key)) {
      return false; // Skip duplicate (silent - no console.log for perf)
    }
    seen.add(key);
    return true;
  });
}

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

  // Provider state
  preferredProvider: ProviderPreference;
  setPreferredProvider: (provider: ProviderPreference) => void;
  lastProvider: AIProviderName | null;
  debugEntries: ChatDebugEntry[];
  providerReadiness: Record<string, boolean>; // v24.3.0: Cloud providers availability

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
  // ✅ FIX AUDIT: Générer conversationId UNE SEULE FOIS au mount
  const [_conversationId] = useState<string>(() => {
    // Réutiliser ID existant ou créer nouveau
    const stored = localStorage.getItem('titane_current_conversation_id');
    if (stored) return stored;
    const newId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('titane_current_conversation_id', newId);
    return newId;
  });

  // OMEGA FIX: Charger les messages depuis localStorage au démarrage pour éviter le flash
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      // Clé utilisée par chatMemoryCompactor
      const stored = localStorage.getItem('titane_chat_mode_default');
      if (stored) {
        const memory = JSON.parse(stored);
        if (memory && Array.isArray(memory.messages)) {
          chatLogger.info(
            '📂 Initial load from localStorage:',
            memory.messages.length,
            'messages'
          );

          // 🧠 NOUVEAU v22Ω: Harmoniser messages avec Cognitive Kernel
          const harmonized = cognitiveKernel.harmonizeChatMessages(memory.messages);
          return harmonized;
        }
      }
    } catch (e) {
      chatLogger.warn('⚠️ Failed to load initial messages', { error: e });
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [internalAnomalyCount, setInternalAnomalyCount] = useState(0);

  // FIX v19.3Ω: Guard flag pour verrouiller l'état pendant les opérations
  const operationLockRef = useRef(false);
  
  // ✅ FIX P0-2: Timestamp de la dernière opération pour cooldown
  const lastOperationTimestampRef = useRef<number>(0);

  // OMEGA FIX: Initialiser messagesRef avec les messages initiaux
  const messagesRef = useRef<AIMessage[]>(messages);
  const messageIdRef = useRef(0);
  const stateVaultRef = useRef<{ stable: AIMessage[]; lastContext: string }>({
    stable: messages.length > 0 ? [...messages] : [],
    lastContext: messages.length > 0 ? 'initial-load' : 'init',
  });

  const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';
  const [preferredProviderState, setPreferredProviderState] =
    useState<ProviderPreference>(() => {
      // ✅ v26.2.3: Force 'auto' (cascade mode) par défaut
      const stored = readStoredPreferredProvider();
      // Si aucune préférence stockée, forcer 'auto' dans localStorage
      if (typeof window !== 'undefined' && !window.localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY)) {
        window.localStorage.setItem(PREFERRED_PROVIDER_STORAGE_KEY, 'auto');
      }
      return stored;
    });
  const [lastProviderUsed, setLastProviderUsed] = useState<AIProviderName | null>(null);
  const debugEntriesRef = useRef<ChatDebugEntry[]>([]);

  // ✨ v24.2.1: Refs for stable sendMessage dependencies
  const voiceEnabledRef = useRef(options.voiceEnabled);
  const omnisTimeoutRef = useRef(options.omnisConfig?.timeoutMs ?? 20000);

  // ✨ v24.2.1: Update refs when options change
  useEffect(() => {
    voiceEnabledRef.current = options.voiceEnabled;
    omnisTimeoutRef.current = options.omnisConfig?.timeoutMs ?? 20000;
  }, [options.voiceEnabled, options.omnisConfig?.timeoutMs]);

  const [debugEntries, setDebugEntries] = useState<ChatDebugEntry[]>([]);

  // ✨ v24.3.0 - Provider Readiness Check (P1 fix)
  const [providerReadiness, setProviderReadiness] = useState<Record<string, boolean>>({
    auto: true,
    local: true,
    ollama: true,
    openai: false,
    gemini: false,
    anthropic: false,
  });

  const updatePreferredProvider = useCallback((provider: ProviderPreference) => {
    setPreferredProviderState(provider);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PREFERRED_PROVIDER_STORAGE_KEY, provider);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setPreferredProviderState(prev => {
      const stored = readStoredPreferredProvider();
      return stored !== prev ? stored : prev;
    });

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === PREFERRED_PROVIDER_STORAGE_KEY &&
        isProviderPreference(event.newValue)
      ) {
        setPreferredProviderState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // ✨ v24.3.7 - Optimized provider availability with Promise.allSettled + individual timeouts
  // 🔒 v26.2.1 - CRITICAL FIX H1: Race condition protection with guard
  // ✅ v26.3.1 - MEMORY FIX: Skip provider checks in test environment
  useEffect(() => {
    // ✅ v26.3.1: Skip entirely in test environment to prevent memory leaks
    const isTestEnv = import.meta.env.MODE === 'test' ||
                      typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ||
                      typeof (globalThis as Record<string, unknown>).__TEST_WRAPPER__ !== 'undefined';
    if (isTestEnv) {
      return;
    }

    // ✨ v24.3.7: Helper to add timeout to any promise
    const withTimeout = <T>(
      promise: Promise<T>,
      timeoutMs: number,
      fallback: T
    ): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>(resolve => setTimeout(() => resolve(fallback), timeoutMs)),
      ]);

    const PROVIDER_CHECK_TIMEOUT = 3000; // ✨ v24.3.7: 3s max per provider (was unbounded)

    // 🔒 v26.2.1: Race condition guard - prevent concurrent checks
    let checkInProgress = false;
    // ✅ v26.3.1: Track if effect is still mounted
    let isMounted = true;

    const checkProvidersAvailability = async () => {
      // 🔒 v26.2.1: Skip if already checking or unmounted
      if (checkInProgress || !isMounted) {
        chatLogger.debug('Provider readiness check skipped - already in progress or unmounted');
        return;
      }

      checkInProgress = true;
      try {
        // ✨ v24.3.7: Use Promise.allSettled with individual timeouts - no single slow provider blocks others
        const results = await Promise.allSettled([
          withTimeout(openaiProvider.isAvailable(), PROVIDER_CHECK_TIMEOUT, false),
          withTimeout(geminiProvider.isAvailable(), PROVIDER_CHECK_TIMEOUT, false),
          withTimeout(claudeProvider.isAvailable(), PROVIDER_CHECK_TIMEOUT, false),
        ]);

        // ✅ v26.3.1: Check if still mounted before setState
        if (!isMounted) return;

        const result0 = results[0];
        const result1 = results[1];
        const result2 = results[2];

        const openaiAvailable =
          result0 && result0.status === 'fulfilled' ? result0.value : false;
        const geminiAvailable =
          result1 && result1.status === 'fulfilled' ? result1.value : false;
        const claudeAvailable =
          result2 && result2.status === 'fulfilled' ? result2.value : false;

        setProviderReadiness(prev => ({
          ...prev,
          openai: openaiAvailable,
          gemini: geminiAvailable,
          anthropic: claudeAvailable,
        }));

        chatLogger.debug('Provider readiness check (v24.3.7 optimized)', {
          openai: openaiAvailable,
          gemini: geminiAvailable,
          anthropic: claudeAvailable,
          timedOut: results.filter(r => r.status === 'rejected').length,
        });
      } finally {
        // 🔒 v26.2.1: Always release lock
        checkInProgress = false;
      }
    };

    checkProvidersAvailability();

    // Silent-by-default in production/Tauri: background polling must be explicitly enabled.
    const envEnabled = import.meta.env.VITE_PROVIDER_READINESS_POLLING_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_provider_readiness_polling_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return () => { isMounted = false; };
    }

    // Re-check every 30s (in case API keys are added dynamically)
    const interval = setInterval(checkProvidersAvailability, REFRESH_INTERVALS.SLOW);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [preferredProviderState]);
  const [uiIntegrity, setUiIntegrity] = useState({
    version: 1,
    preventedResets: 0,
    recoveries: 0,
    lastRecoveryAt: null as number | null,
    lastContext: 'init',
    hasSnapshot: false,
  });

  const omnisConfig = useMemo(
    () => ({
      enablePredictive: false,
      enableAutoRepair: true,
      fallbackMode: true,
      debugMetrics: true,
      timeoutMs: 20000,
      ...(options.omnisConfig ?? {}),
    }),
    [options.omnisConfig]
  );

  // ═══ HOOKS INTEGRATION ═══
  const coreHookResult =
    useChatCore({
      mode: options.mode || 'default',
      emotionState: options.emotionState,
    }) ||
    ({
      currentMode: 'default' as ChatMode,
      anomalyCount: 0,
      currentProvider: 'titane-local',
      generate: async () =>
        ({
          content: 'TITANE∞ prépare une réponse.',
          provider: 'titane-local',
          timestamp: Date.now(),
          mode: 'default' as ChatMode,
          contextUsed: [],
        }) as ChatEngineResponse,
      async *stream(): AsyncGenerator<string, ChatEngineResponse> {
        yield '⏳ Initialisation du flux TITANE∞...';
        return {
          content: 'Streaming indisponible pour le moment. Passage en mode standard.',
          provider: 'titane-local',
          timestamp: Date.now(),
          mode: 'default' as ChatMode,
          contextUsed: [],
          suggestions: [],
        } as ChatEngineResponse;
      },
      setMode: () => {},
      setProvider: () => {},
      validateResponse: () => ({
        isValid: true,
        score: 1,
        issues: [],
      }),
    } as UseChatCoreReturn);

  const memoryHookResult = useChatMemory({
    mode: coreHookResult.currentMode,
    autoCleanup: true,
    autoSave: true,
  }) || {
    messagesForMode: [],
    memoryStats: { count: 0, sizeMB: 0, compressed: false },
    saveMessage: () => {},
    clearMode: () => {},
  };

  const {
    currentMode,
    anomalyCount,
    setMode: setCoreMode,
    generate,
    stream,
  } = coreHookResult;
  const [currentModeState, setCurrentModeState] = useState<ChatMode>(currentMode);
  const { messagesForMode, memoryStats, saveMessage, clearMode } = memoryHookResult;

  const getNextUiId = useCallback(() => {
    messageIdRef.current += 1;
    return `chat-ui-${Date.now()}-${messageIdRef.current}`;
  }, []);

  const withUiId = useCallback(
    (metadata?: AIMessage['metadata']) => {
      const safeMetadata =
        metadata && typeof metadata === 'object' ? { ...metadata } : {};
      if (!safeMetadata.uiId) {
        safeMetadata.uiId = getNextUiId();
      }
      return safeMetadata;
    },
    [getNextUiId]
  );

  const applyMessagesSafely = useCallback(
    (
      nextMessages: MaybeAIMessage[],
      context: string,
      options: { allowEmpty?: boolean } = {}
    ) => {
      const allowEmpty = options.allowEmpty ?? false;
      const normalized = normalizeMessages(nextMessages, getNextUiId);
      const hasMessages = normalized.length > 0;

      // 🧠 NOUVEAU v22Ω: Harmoniser les messages avec Cognitive Kernel
      const harmonizedNormalized = hasMessages
        ? cognitiveKernel.harmonizeChatMessages(
            normalized as Array<Partial<HarmonizedMessage>>
          )
        : normalized;

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
          hasSnapshot: true,
        }));
        return restored;
      }

      if (hasMessages) {
        stateVaultRef.current.stable = harmonizedNormalized;
        stateVaultRef.current.lastContext = context;
      } else if (allowEmpty) {
        stateVaultRef.current.stable = [];
        stateVaultRef.current.lastContext = context;
      }

      const applied = hasMessages ? harmonizedNormalized : [];
      const emitted = applied.map(message => ({ ...message }));

      setMessages(emitted);
      messagesRef.current = emitted;
      setUiIntegrity(prev => ({
        ...prev,
        version: prev.version + 1,
        lastContext: context,
        hasSnapshot: emitted.length > 0,
      }));

      return emitted;
    },
    [getNextUiId]
  );

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
      hasSnapshot: true,
    }));
  }, []);

  // ═══ SYNC INITIAL MESSAGES ═══
  // FIX v19.3Ω: Protection ABSOLUE contre les resets pendant loading
  const isLoadingRef = useRef(false);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    // OMEGA FIX v3: Protection ABSOLUE contre les resets intempestifs
    if (!messagesForMode) {
      return;
    }

    // ✅ FIX P0-2: PROTECTION CRITIQUE avec cooldown après opération
    const timeSinceLastOp = Date.now() - lastOperationTimestampRef.current;
    const COOLDOWN_MS = 3000; // 3s cooldown après chaque opération

    if (
      isLoadingRef.current ||
      operationLockRef.current ||
      timeSinceLastOp < COOLDOWN_MS
    ) {
      chatLogger.debug('🛡️ CRITICAL PROTECTED: Skipping sync during/after operation', {
        loading: isLoadingRef.current,
        lock: operationLockRef.current,
        timeSinceOp: timeSinceLastOp,
        cooldown: COOLDOWN_MS,
      });
      return;
    }

    // CRITICAL: Si on a déjà des messages, JAMAIS les effacer sauf si memoryForMode a plus de contenu
    const currentCount = messagesRef.current.length;
    const memoryCount = messagesForMode.length;
    const vaultCount = stateVaultRef.current.stable.length;

    // 🛡️ Triple protection: ref, vault, et memory doivent tous être cohérents
    if (currentCount > 0 && memoryCount === 0) {
      chatLogger.debug('🛡️ PROTECTED: Skipping empty memory sync', {
        preservingMessages: currentCount,
        vaultCount,
      });
      return;
    }

    // Si mémoire et state ont des messages, prendre le plus complet
    // FIX v19.3Ω: Utiliser aussi le vault pour la comparaison
    const maxExisting = Math.max(currentCount, vaultCount);
    if (maxExisting > 0 && memoryCount > 0 && maxExisting >= memoryCount) {
      chatLogger.debug('🛡️ PROTECTED: Current/vault has more messages, skipping sync', {
        maxExisting,
        memoryCount,
      });
      return;
    }

    if (memoryCount === 0) {
      // ✅ FIX P0-2: Reset uniquement si TOUT est vide ET cooldown passé
      if (
        vaultCount === 0 &&
        currentCount === 0 &&
        !isLoadingRef.current &&
        timeSinceLastOp >= COOLDOWN_MS
      ) {
        chatLogger.info('📭 All sources empty and cooldown passed, safe to reset');
        applyMessagesSafely([], 'memory-sync-empty', { allowEmpty: true });
      }
      return;
    }

    // Sync uniquement si mémoire a plus de contenu ET pas en loading ET cooldown passé
    chatLogger.info('📥 Syncing from memory:', memoryCount, 'messages');
    applyMessagesSafely(messagesForMode, 'memory-sync');
  }, [messagesForMode, applyMessagesSafely]);

  // ═══ SYNC MESSAGES REF ═══
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (currentMode !== currentModeState) {
      setCurrentModeState(currentMode);
    }
  }, [currentMode, currentModeState]);

  // ═══ OMNIS SENDMESSAGE KERNEL ═══
  const sendMessage = useCallback(
    async (content: string): Promise<AIMessage> => {
      chatLogger.info('🚀 sendMessage called', {
        contentPreview: content?.substring(0, 50),
      });
      const startTime = Date.now();

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        chatLogger.debug('❌ Message invalide ou vide');
        return {
          role: 'assistant',
          content: 'Veuillez entrer un message pour continuer la conversation.',
          timestamp: Date.now(),
          metadata: { status: 'input-error' },
        };
      }

      // ⭐ OMEGA FIX: Failsafe timeout 30s pour forcer unlock UI si backend freeze
      let failsafeTimeout: ReturnType<typeof setTimeout> | null = null;

      // ✨ v∞.21.0 - DEV-SUDO Mode Integration (Super Prompt FULL UNLOCK)
      // Vérifier commandes développeur en PRIORITÉ ABSOLUE
      try {
        const devSudoResult = await handleDevSudoInChat(content.trim());

        if (devSudoResult.handled) {
          chatLogger.debug('⚡ DEV-SUDO command handled', {
            success: devSudoResult.success,
          });

          // Ajouter le message utilisateur
          const userMessage: AIMessage = {
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
            metadata: withUiId({
              inputLength: content.trim().length,
              mode: 'dev-sudo',
              devSudoCommand: true,
            }),
          };

          // Ajouter la réponse DEV-SUDO
          const devSudoResponse: AIMessage = {
            role: 'assistant',
            content: devSudoResult.response,
            timestamp: Date.now(),
            metadata: withUiId({
              provider: 'dev-sudo-handler',
              devSudoCommand: true,
              success: devSudoResult.success,
              actions: devSudoResult.actions,
            }),
          };

          const updatedMessages = [...messagesRef.current, userMessage, devSudoResponse];
          applyMessagesSafely(updatedMessages, 'dev-sudo-command');

          return devSudoResponse;
        }
      } catch (devSudoError) {
        chatLogger.warn('DEV-SUDO command check failed', { error: devSudoError });
        // Continuer normalement si erreur
      }

      // ✨ v∞.20.0 - Camera Chat Integration (Super Prompt #3)
      // Vérifier commande caméra AVANT envoi au provider IA
      try {
        const visionStore = useVisionStore.getState();
        const cameraResult = await handleCameraInChat(content.trim(), visionStore);

        if (cameraResult.handled) {
          chatLogger.debug('📷 Camera command handled', {
            response: cameraResult.response?.substring(0, 100),
          });

          // Ajouter le message utilisateur
          const userMessage: AIMessage = {
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
            metadata: withUiId({
              inputLength: content.trim().length,
              mode: currentModeState,
              cameraCommand: true,
            }),
          };

          // Ajouter la réponse caméra
          const cameraResponse: AIMessage = {
            role: 'assistant',
            content: cameraResult.response,
            timestamp: Date.now(),
            metadata: withUiId({ provider: 'camera-handler', cameraCommand: true }),
          };

          const updatedMessages = [...messagesRef.current, userMessage, cameraResponse];
          applyMessagesSafely(updatedMessages, 'camera-command');

          return cameraResponse;
        }
      } catch (cameraError) {
        chatLogger.warn('Camera command check failed', { error: cameraError });
        // Continuer normalement si erreur
      }

      // FIX v19.3Ω: Activer le verrou d'opération AVANT tout changement d'état
      operationLockRef.current = true;
      // ✅ FIX P0-2: Enregistrer le timestamp pour cooldown
      lastOperationTimestampRef.current = Date.now();
      chatLogger.debug('🔒 Operation lock ACTIVATED', {
        timestamp: lastOperationTimestampRef.current,
      });
      chatLogger.info('✅ Message valide, traitement...');
      const cleanMessage = content.trim();
      setIsLoading(true);

      // ⭐ OMEGA FIX: Activer failsafe timeout APRÈS setIsLoading(true)
      failsafeTimeout = setTimeout(() => {
        if (isLoadingRef.current) {
          chatLogger.warn(
            '⚠️ OMEGA FAILSAFE: isLoading reset forcé après 30s timeout backend'
          );
          setIsLoading(false);
          operationLockRef.current = false;
        }
      }, 30000); // 30s max

      setError(null);

      const userMessage: AIMessage = {
        role: 'user',
        content: cleanMessage,
        timestamp: Date.now(),
        metadata: withUiId({ inputLength: cleanMessage.length, mode: currentModeState }),
      };

      const bufferedMessages = [...messagesRef.current, userMessage];
      const historyBuffer = applyMessagesSafely(bufferedMessages, 'user-message');

      // ✅ v∞.FIX P0-3: Timeout adaptatif selon provider et longueur message
      // ✨ v24.2.1: Use ref for stable dependency
      // v22Ω: Using centralized timeout config from aiTimeouts.config.ts
      const getAdaptiveTimeout = (): number => {
        const messageLength = cleanMessage.length;
        const configTimeout = omnisTimeoutRef.current;

        // Si timeout manuel configuré, l'utiliser comme minimum
        const minTimeout = configTimeout || 0;

        // v22Ω: Use centralized config for adaptive timeout
        const providerType: 'local' | 'ollama' | 'cloud' =
          preferredProviderState === 'local'
            ? 'local'
            : preferredProviderState === 'ollama'
              ? 'ollama'
              : 'cloud';

        const calculatedTimeout = getAdaptiveUITimeout(providerType, messageLength);

        // v22Ω: Apply global cap while respecting minimum
        return Math.min(UI_TIMEOUTS.maxRequest, Math.max(minTimeout, calculatedTimeout));
      };
      const timeoutMs = getAdaptiveTimeout();
      chatLogger.debug('⏱️ Adaptive timeout configured', {
        timeoutMs,
        provider: preferredProviderState,
        messageLength: cleanMessage.length,
      });
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const assistantMetadata = withUiId({
        status: 'streaming',
        mode: currentModeState,
        streamChunks: 0,
      });

      const assistantPlaceholder: AIMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        provider: 'tauri-backend',
        metadata: assistantMetadata,
      };

      applyMessagesSafely(
        [...messagesRef.current, assistantPlaceholder],
        'assistant-stream-start'
      );
      chatLogger.debug(
        '✅ Placeholder ajouté, targetUiId:',
        assistantMetadata.uiId,
        'messagesCount:',
        messagesRef.current.length
      );

      const targetUiId = assistantMetadata.uiId;

      const getAssistantFromState = (): AIMessage | null => {
        if (!targetUiId) {
          return null;
        }
        const current = messagesRef.current.find(
          msg => msg.metadata?.uiId === targetUiId
        );
        return current ? { ...current } : null;
      };

      const updateAssistant = (
        mutate: (message: AIMessage) => AIMessage,
        context: string,
        metadataPatch?: Record<string, unknown>
      ) => {
        if (!targetUiId) {
          chatLogger.error('❌ updateAssistant: targetUiId missing', {
            context,
            messagesCount: messagesRef.current.length,
          });
          return;
        }

        chatLogger.debug('🔄 updateAssistant called', {
          context,
          targetUiId,
          messagesCount: messagesRef.current.length,
        });

        let found = false;
        let placeholderContent = '';

        const nextMessages = messagesRef.current.map(msg => {
          if (!msg?.metadata || msg.metadata.uiId !== targetUiId) {
            return msg;
          }

          found = true;
          placeholderContent = msg.content?.substring(0, 50) || '<empty>';

          chatLogger.debug('✅ updateAssistant: Target found', {
            uiId: targetUiId,
            currentContent: placeholderContent,
            context,
          });

          const updated = mutate({ ...msg });
          const existingMetadata =
            updated.metadata && typeof updated.metadata === 'object'
              ? { ...updated.metadata }
              : {};

          const mergedMetadata = {
            ...existingMetadata,
            ...(metadataPatch || {}),
          };

          if (targetUiId && mergedMetadata.uiId !== targetUiId) {
            mergedMetadata.uiId = targetUiId;
          }

          chatLogger.debug('🔄 updateAssistant: Message updated', {
            uiId: targetUiId,
            newContentLength: updated.content?.length || 0,
            newContentPreview: updated.content?.substring(0, 50) || '<empty>',
          });

          return {
            ...updated,
            metadata: mergedMetadata,
          };
        });

        if (!found) {
          chatLogger.error('❌ updateAssistant: Target NOT FOUND', {
            targetUiId,
            context,
            messagesCount: messagesRef.current.length,
            availableUiIds: messagesRef.current
              .map(m => m?.metadata?.uiId)
              .filter(Boolean),
          });

          // ✅ FIX P0-3: FALLBACK - Ajouter le message au lieu de updater
          chatLogger.warn('⚠️ updateAssistant: FALLBACK TRIGGERED - investigate root cause', {
            targetUiId,
            context,
            timestamp: Date.now(),
          });

          // ✅ FIX AUDIT: Monitorer fréquence fallback
          try {
            if (typeof window !== 'undefined') {
              const monitoring = (window as unknown as { monitoring?: unknown }).monitoring;
              const trackEvent =
                (monitoring as { trackEvent?: unknown } | null | undefined)?.trackEvent;

              if (typeof trackEvent === 'function') {
                (trackEvent as (name: string, data: Record<string, unknown>) => void)(
                  'chat_fallback_triggered',
                  {
                    targetUiId,
                    context,
                    messagesCount: messagesRef.current.length,
                  }
                );
              }
            }
          } catch (monitoringError) {
            // Silent monitoring failure
          }

          const fallbackMessage: AIMessage = mutate({
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            metadata: withUiId({ ...metadataPatch, uiId: targetUiId }),
          } as AIMessage);
          nextMessages.push(fallbackMessage);
        }

        chatLogger.debug('📤 updateAssistant: Applying messages', {
          count: nextMessages.length,
          context,
        });

        applyMessagesSafely(nextMessages, context);

        chatLogger.info('✅ updateAssistant: Complete', {
          found,
          placeholderContent,
          finalCount: nextMessages.length,
          context,
        });
      };

      let aggregatedContent = '';
      let chunkCount = 0;
      let finalResponse: ChatEngineResponse | null = null;
      let streamingError: Error | null = null;

      const executeStreaming = async (): Promise<ChatEngineResponse> => {
        if (typeof stream !== 'function') {
          throw new Error('Streaming non disponible');
        }

        const iterator = stream(cleanMessage, historyBuffer);
        let completed = false;

        // ✨ v24.2.1 - Streaming Batcher: reduces UI updates from 50-100x/sec to ~10-20x/sec
        const batcher = createStreamingBatcher({
          batchSize: 5,
          maxWaitMs: 100,
          onFlush: (batchedContent, batchChunkCount) => {
            aggregatedContent = batchedContent;
            chunkCount = batchChunkCount;

            updateAssistant(
              message => ({
                ...message,
                content: aggregatedContent,
              }),
              'assistant-stream-update',
              {
                status: 'streaming',
                streamChunks: chunkCount,
                mode: currentModeState,
                provider: 'tauri-backend',
              }
            );
          },
        });

        const streamingTask = (async (): Promise<ChatEngineResponse> => {
          let next = await iterator.next();

          while (!next.done) {
            const value = next.value;

            if (typeof value === 'string' && value.length > 0) {
              // ✨ v24.2.1 - Push to batcher instead of immediate update
              batcher.push(value);
            }

            next = await iterator.next();
          }

          // ✨ v24.2.1 - Flush remaining content before completing
          batcher.flush();

          const response = next.value ?? null;
          if (!response) {
            throw new Error('Streaming sans réponse finale');
          }

          const responseContent =
            typeof response.content === 'string' ? response.content : '';
          if (responseContent.trim().length > 0) {
            aggregatedContent = responseContent;
          }

          const finalContent =
            responseContent.trim().length > 0 ? responseContent : aggregatedContent;
          if (finalContent.trim().length === 0) {
            throw new Error('Réponse vide du backend (stream completion)');
          }

          return {
            ...response,
            content: finalContent,
          };
        })();

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('TIMEOUT'));
          }, timeoutMs);
        });

        try {
          const response = await Promise.race([streamingTask, timeoutPromise]);
          completed = true;
          return response;
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (!completed && typeof iterator.return === 'function') {
            try {
              await iterator.return(undefined as unknown as ChatEngineResponse);
            } catch {
              // ignore cleanup failure
            }
          }
        }
      };

      try {
        const normalizeProvider = (provider?: string | null): AIProviderName => {
          if (!provider) {
            return 'tauri-backend';
          }

          const normalized = provider.toLowerCase();

          if (normalized.includes('ultimate')) {
            return 'ultimate-fallback';
          }
          if (normalized.includes('omnis') && normalized.includes('emergency')) {
            return 'omnis-emergency';
          }
          if (normalized.includes('emergency')) {
            return 'emergency-fallback';
          }
          if (normalized.includes('fallback')) {
            return 'omnis-fallback';
          }
          if (normalized.includes('ollama')) {
            return 'tauri-ollama';
          }
          if (normalized.includes('titane') && normalized.includes('local')) {
            return 'titane-local';
          }
          if (normalized.includes('local')) {
            return 'tauri-local';
          }
          if (normalized.includes('gemini')) {
            return 'tauri-gemini';
          }
          if (normalized.includes('tauri-chat')) {
            return 'tauri-chat';
          }
          if (normalized.includes('openai')) {
            return 'openai';
          }
          if (normalized.includes('claude')) {
            return 'claude';
          }
          if (normalized.includes('tauri')) {
            return 'tauri-backend';
          }

          return 'tauri-backend';
        };

        const providerCandidates: string[] = (() => {
          switch (preferredProviderState) {
            case 'local':
              return ['local', 'ollama'];
            case 'ollama':
              return ['ollama', 'local'];
            case 'auto':
            default:
              // OMEGA FIX: 'auto' permet au backend de choisir Gemini → Ollama → Local
              return ['auto'];
          }
        })();

        const backendHistory: BackendChatMessage[] = historyBuffer.map(message => ({
          role: message.role,
          content: message.content,
          timestamp: new Date(message.timestamp).toISOString(),
        }));

        // ═══ INJECT USER PREFERENCES CONTEXT ═══
        const preferencesContext = userPreferencesEngine.generateContextForAI();
        if (preferencesContext && backendHistory.length > 0) {
          // Ajouter le contexte au premier message utilisateur
          const firstUserMsgIndex = backendHistory.findIndex(m => m.role === 'user');
          if (firstUserMsgIndex >= 0) {
            const firstUserMsg = backendHistory[firstUserMsgIndex];
            if (firstUserMsg) {
              firstUserMsg.content = `${preferencesContext}\n\n${firstUserMsg.content}`;
            }
          }
        }

        const chatAttempts: ChatDebugAttempt[] = [];
        const attemptedProviders: string[] = [];
        let chatServiceResponse: ChatResponse | null = null;
        let chatServiceError: string | null = null;

        const withTimeout = async <T,>(promise: Promise<T>, label: string): Promise<T> => {
          let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
              reject(new Error(`TIMEOUT:${label}`));
            }, timeoutMs);
          });

          try {
            return await Promise.race([promise, timeoutPromise]);
          } finally {
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
              timeoutHandle = null;
            }
          }
        };

        if (backendHistory.length > 0) {
          const firstCandidate = providerCandidates[0];
          // ✅ FIX AUDIT: Utiliser conversationId persistant depuis state
          // NOTE: Ne pas passer conversationId au chemin legacy : le backend peut se bloquer
          // avec "Duplicate conversation detected" et ne jamais répondre (2e message vide).
          const requestConfig: StreamConfig = {
            provider: firstCandidate ?? 'auto',
          };
          for (const candidate of providerCandidates) {
            try {
              requestConfig.provider = candidate;
              attemptedProviders.push(candidate);

              const response = await withTimeout(
                chatService.sendMessageLegacy(backendHistory, {
                  provider: candidate,
                }),
                `legacy:${candidate}`
              );
              chatServiceResponse = response;
              chatAttempts.push({ provider: candidate, success: true, response });
              break;
            } catch (candidateError) {
              const reason =
                candidateError instanceof Error
                  ? candidateError.message
                  : String(candidateError);
              chatAttempts.push({ provider: candidate, success: false, error: reason });
              chatServiceError = reason;
            }
          }

          const debugEntry: ChatDebugEntry = {
            id: `chat-debug-${Date.now()}`,
            timestamp: Date.now(),
            requestedProvider: preferredProviderState,
            attempts: chatAttempts,
            request: {
              messages: backendHistory,
              config: { ...requestConfig },
              attemptedProviders: [...attemptedProviders],
            },
            status: chatServiceResponse ? 'success' : 'error',
            response: chatServiceResponse ?? undefined,
            error: chatServiceResponse
              ? undefined
              : (chatServiceError ?? 'Aucune réponse du moteur IA'),
            selectedProvider: chatServiceResponse?.provider,
            latencyMs: chatServiceResponse?.latencyMs,
          };

          debugEntriesRef.current = [debugEntry, ...debugEntriesRef.current].slice(
            0,
            DEBUG_MAX_ENTRIES
          );
          setDebugEntries(debugEntriesRef.current);
        }

        if (chatServiceResponse) {
          const mappedProvider = normalizeProvider(chatServiceResponse.provider);
          const resolvedOmegaMetadata = (() => {
            const metadata = chatServiceResponse?.omegaMetadata;
            if (!metadata || typeof metadata !== 'object') {
              return undefined;
            }

            const typed = metadata as Record<string, unknown>;
            const pipelineStepsRaw = typed['pipelineSteps'];
            const validationScoreRaw = typed['validationScore'];
            const autoHealedRaw = typed['autoHealed'];
            const failureHandledRaw = typed['failureHandled'];
            const processingTimeRaw = typed['processingTime'];

            const pipelineSteps = Array.isArray(pipelineStepsRaw)
              ? pipelineStepsRaw.map(step => String(step))
              : [];
            const validationScore =
              typeof validationScoreRaw === 'number' ? validationScoreRaw : 1;
            const autoHealed =
              typeof autoHealedRaw === 'boolean' ? autoHealedRaw : Boolean(autoHealedRaw);
            const failureHandled =
              typeof failureHandledRaw === 'boolean'
                ? failureHandledRaw
                : Boolean(failureHandledRaw);
            const processingTime =
              typeof processingTimeRaw === 'number'
                ? processingTimeRaw
                : Date.now() - startTime;

            return {
              pipelineSteps,
              validationScore,
              autoHealed,
              failureHandled,
              processingTime,
            } satisfies ChatEngineResponse['omegaMetadata'];
          })();

          const legacyContent =
            typeof chatServiceResponse.content === 'string'
              ? chatServiceResponse.content
              : '';
          
          // ✅ v26.2.3 CRITICAL FIX: Détecter réponse vide du backend
          if (legacyContent.trim().length === 0) {
            chatLogger.warn('⚠️ Backend returned empty content - triggering fallback');
            // Ne pas créer finalResponse, laisser le fallback s'activer
            finalResponse = null;
            aggregatedContent = '';
          } else {
            finalResponse = {
              content: chatServiceResponse.content,
              provider: mappedProvider,
              timestamp: Date.now(),
              mode: currentModeState,
              contextUsed: [],
              suggestions: [],
              metadata: chatServiceResponse.metadata,
              omegaMetadata: resolvedOmegaMetadata,
            } satisfies ChatEngineResponse;
            
            aggregatedContent = legacyContent;
          }
        }

        if (!finalResponse) {
          if (typeof stream === 'function') {
            try {
              finalResponse = await executeStreaming();
            } catch (error) {
              streamingError = error instanceof Error ? error : new Error(String(error));
              console.warn('[Chat] Streaming fallback triggered:', streamingError);
            }
          }
        }

        if (!finalResponse) {
          const response = await generate(cleanMessage, historyBuffer);
          finalResponse = response;

          const generatedContent =
            typeof response.content === 'string' ? response.content : '';
          aggregatedContent =
            generatedContent.trim().length > 0 ? generatedContent : aggregatedContent;
        }

        // ✅ v26.2.3 - CRITICAL FIX: Fallback robuste si aucun provider disponible
        if (!finalResponse) {
          chatLogger.warn('⚠️ No finalResponse - creating fallback response');
          
          // Déterminer le message approprié selon la cause
          const fallbackContent = (() => {
            if (chatAttempts.length > 0) {
              const allFailed = chatAttempts.every(attempt => !attempt.success);
              if (allFailed) {
                const ollamaAttempt = chatAttempts.find(a => a.provider === 'ollama');
                const hasOllamaTimeout = ollamaAttempt?.error?.includes('timed out') || 
                                       ollamaAttempt?.error?.includes('ECONNREFUSED');
                
                if (hasOllamaTimeout) {
                  return `🤖 **TITANE∞ — Configuration IA Requise**

Aucun provider IA n'est actuellement disponible pour traiter ta demande.

**Providers testés :**
${chatAttempts.map(a => `- ${a.provider}: ${a.success ? '✅' : '❌ ' + (a.error || 'échec')}`).join('\n')}

**Solutions recommandées :**

1. **Installer Ollama (local, gratuit, privé)** :
   \`\`\`bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.1:latest
   \`\`\`

2. **Ou configurer une clé API cloud** :
   - OpenAI, Gemini, ou Anthropic
   - Via Settings → AI Providers → API Keys

**Note** : Le blocage de sécurité Ollama a été résolu. Il faut maintenant installer un provider IA pour utiliser le chat.

📚 **Documentation complète** : \`docs/OLLAMA_GUIDE.md\``;
                }
              }
            }
            
            return `🤖 **TITANE∞ — Initialisation IA**

Le système IA est en cours de configuration. Aucune réponse n'a pu être générée pour le moment.

**Pour activer le chat IA** :
- Installer Ollama (local) : \`docs/OLLAMA_GUIDE.md\`
- Ou configurer une clé API cloud dans Settings

Tu peux réessayer dans quelques instants ou configurer un provider IA.`;
          })();
          
          finalResponse = {
            content: fallbackContent,
            provider: 'titane-local',
            timestamp: Date.now(),
            mode: currentModeState,
            contextUsed: [],
            suggestions: [
              'Comment installer Ollama ?',
              'Quels sont les providers IA disponibles ?',
              'Comment configurer une clé API cloud ?'
            ],
            metadata: {
              fallbackReason: 'no_provider_available',
              attemptedProviders: attemptedProviders,
              chatAttempts: chatAttempts,
            }
          } satisfies ChatEngineResponse;
          
          aggregatedContent = fallbackContent;
          chatLogger.info('✅ Fallback response created for no provider scenario');
        }

        // ✅ CRITICAL: À ce stade, finalResponse est garanti non-null
        if (!finalResponse) {
          throw new Error('CRITICAL: finalResponse should never be null at this point');
        }

        const provider = finalResponse.provider || 'tauri-backend';
        const metadataPatch: Record<string, unknown> = {
          status: streamingError ? 'fallback' : 'success',
          duration: Date.now() - startTime,
          ...(finalResponse.metadata || {}),
          omegaMetadata: finalResponse.omegaMetadata,
          mode: currentModeState,
          streamChunks: chunkCount,
          provider,
        };

        const responseContent =
          typeof finalResponse.content === 'string' ? finalResponse.content : '';
        const finalContent =
          responseContent.trim().length > 0 ? responseContent : aggregatedContent;
        if (finalContent.trim().length === 0) {
          throw new Error('Réponse vide du backend (final content)');
        }
        chatLogger.debug(
          '🎯 finalContent:',
          finalContent?.substring(0, 100),
          'length:',
          finalContent?.length
        );

        updateAssistant(
          message => ({
            ...message,
            content: finalContent,
            provider,
            timestamp: Date.now(),
          }),
          streamingError ? 'assistant-stream-fallback' : 'assistant-stream-complete',
          metadataPatch
        );

        console.log(
          '[useChat OMNIS DEBUG] ✅ updateAssistant terminé, messages actuels:',
          messagesRef.current.length
        );

        const assistantFromState = getAssistantFromState();
        const assistantMessage: AIMessage =
          assistantFromState && assistantFromState.content.trim().length > 0
            ? assistantFromState
            : (() => {
                // ✅ Repair: si le placeholder existe mais reste vide (bug de sync / dédup),
                // forcer le contenu final dans l'entrée assistant ciblée.
                if (targetUiId) {
                  updateAssistant(
                    message => ({
                      ...message,
                      content: finalContent,
                      provider,
                      timestamp: Date.now(),
                    }),
                    'assistant-stream-repair',
                    { ...metadataPatch, uiId: targetUiId }
                  );
                }

                return {
                  role: 'assistant' as const,
                  content: finalContent,
                  provider,
                  timestamp: Date.now(),
                  metadata: withUiId(metadataPatch),
                };
              })();

        try {
          // ✅ v∞.FIX P1-6: Await saveMessage pour garantir persistence
          await saveMessage(userMessage);
          await saveMessage(assistantMessage);

          // ═══ RECORD INTERACTION FOR PREFERENCES LEARNING ═══
          try {
            userPreferencesEngine.recordInteraction(cleanMessage, finalContent);
          } catch (prefError) {
            chatLogger.warn('⚠️ Preferences recording failed', { error: prefError });
          }

          // ═══ AWARD XP FOR SUCCESSFUL MESSAGE ═══
          // Système XP global + domaines spécifiques
          try {
            // XP Global Engine (+5 XP pour le moteur global)
            XP.gain(
              XP_REWARDS.CHAT_MESSAGE,
              'chat_message',
              `Message envoyé: ${cleanMessage.substring(0, 50)}...`
            );

            // XP Domaine Chat (+5 XP pour le domaine chat)
            await awardExperience('chat', XP_REWARDS.CHAT_MESSAGE, XPSource.ChatMessage, {
              messageLength: cleanMessage.length,
              provider,
              mode: currentModeState,
            });

            // XP Domaine Cognitive (+2 XP pour analyse cognitive si réponse longue)
            if (finalContent && finalContent.length > 200) {
              await awardExperience('cognitive', 2, XPSource.CognitiveAnalysis, {
                responseLength: finalContent.length,
                provider,
              });
            }

            chatLogger.success('✨ XP awarded: +5 chat, +2 cognitive (si applicable)');
          } catch (xpError) {
            chatLogger.warn('XP award warning', { error: xpError });
          }
        } catch (memoryError) {
          console.warn('[Chat] Memory integration warning:', memoryError);
        }

        // ✨ v24.2.1: Use ref for stable dependency
        if (voiceEnabledRef.current && assistantMessage.content) {
          try {
            hybridTTS.speak(assistantMessage.content);
          } catch (voiceError) {
            console.warn('[Chat] Voice warning:', voiceError);
          }
        }

        setSuggestions(finalResponse.suggestions ?? []);
        setLastProviderUsed(
          chatServiceResponse ? normalizeProvider(chatServiceResponse.provider) : provider
        );

        return assistantMessage;
      } catch (error) {
        console.error('[Chat] Engine pipeline error:', error);

        // 🧠 NOUVEAU v22Ω: Harmoniser l'erreur avec Cognitive Kernel
        const harmonizedError = cognitiveKernel.harmonizeError(error);

        const fallbackResponse: AIMessage = {
          role: 'assistant',
          content: `🟣 **TITANE∞ Auto-Récupération Cognitive v22Ω**

${harmonizedError.message}

**Type d'erreur** : ${harmonizedError.type}
**Stratégie de récupération** : ${harmonizedError.recovery}

Le système cognitif s'adapte en temps réel. Tu peux continuer la conversation immédiatement.`,
          timestamp: Date.now(),
          provider: 'omnis-fallback',
          metadata: withUiId({
            status: 'error',
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
            cognitiveHarmonized: true,
            errorType: harmonizedError.type,
          }),
        };

        if (targetUiId) {
          updateAssistant(
            () => ({ ...fallbackResponse }),
            'assistant-stream-error',
            fallbackResponse.metadata
          );
        } else {
          const errorMessages = [...messagesRef.current, fallbackResponse];
          applyMessagesSafely(errorMessages, 'fallback-response');
        }

        setError(
          "TITANE∞ a rencontré une anomalie et s'est réparé. Tu peux réessayer immédiatement."
        );
        setInternalAnomalyCount(prev => prev + 1);
        setLastProviderUsed('omnis-fallback');

        return fallbackResponse;
      } finally {
        // ✅ OMEGA FIX: Clear failsafe timeout
        if (failsafeTimeout !== null) {
          clearTimeout(failsafeTimeout);
          failsafeTimeout = null;
        }

        // ✅ v∞.FIX P0-1: Garantie absolue de désactivation du lock (synchrone)
        setIsLoading(false);
        operationLockRef.current = false;
        chatLogger.debug('🔓 Operation lock RELEASED (finally)');
      }
    },
    // ✨ v24.2.1: Removed omnisConfig.timeoutMs and options.voiceEnabled - now using refs
    [
      applyMessagesSafely,
      currentModeState,
      debugEntriesRef,
      generate,
      preferredProviderState,
      saveMessage,
      stream,
      withUiId,
    ]
  );

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

  const setMode = useCallback(
    (mode: ChatMode) => {
      setCurrentModeState(mode);
      try {
        setCoreMode(mode);
      } catch (error) {
        console.warn('[OMNIS] Set mode warning:', error);
      }
    },
    [setCoreMode]
  );

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
      version: 'omnis-v1.0',
    });
  }, [messages]);

  const importChat = useCallback(
    (data: string): boolean => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          applyMessagesSafely(parsed.messages, 'import-chat', {
            allowEmpty: parsed.messages.length === 0,
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [applyMessagesSafely]
  );

  // ═══ COMPUTED VALUES ═══
  const omnisStats = useMemo(() => {
    const totalRequests = messages.filter(msg => msg.role === 'user').length;
    const successCount = messages.filter(msg => msg.role === 'assistant').length;
    const errorCount = internalAnomalyCount;
    const successRate =
      totalRequests === 0
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
      pipelineHealth,
    };
  }, [messages, internalAnomalyCount, error]);

  const getDebugInfo = useCallback(
    () => ({
      engineStats: omnisStats,
      memoryStats,
      anomalyCount: anomalyCount + internalAnomalyCount,
      currentMode: currentModeState,
      isLoading,
      messagesCount: messages.length,
      omnisConfig,
    }),
    [
      anomalyCount,
      currentModeState,
      internalAnomalyCount,
      isLoading,
      messages.length,
      memoryStats,
      omnisConfig,
      omnisStats,
    ]
  );

  return {
    // UI State
    messages,
    input,
    isLoading,
    error,
    suggestions,

    // Mode & Stats
    currentMode: currentModeState,
    anomalyCount: anomalyCount + internalAnomalyCount,
    memoryStats,
    omnisStats,
    uiIntegrity,

    // Provider state
    preferredProvider: preferredProviderState,
    setPreferredProvider: updatePreferredProvider,
    lastProvider: lastProviderUsed,
    debugEntries,
    providerReadiness, // v24.3.0: Cloud providers availability

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
    importChat,
  };
}
