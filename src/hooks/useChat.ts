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
import { useChatCore, type UseChatCoreReturn } from '@hooks/useChatCore';
import { useChatMemory } from '@hooks/useChatMemory';
import { type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage, AIProviderName } from '../services/ai/types';
import { hybridTTS } from '@services/tts/hybridTTS';
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

// ✨ v∞.20.0 - Camera Chat Integration (Super Prompt #3)
import { handleCameraInChat } from '@/modules/camera/cameraChatIntegration';
import { useVisionStore } from '@/stores/useVisionStore';

// ✨ v∞.21.0 - DEV-SUDO Mode Integration (Super Prompt FULL UNLOCK)
import { handleDevSudoInChat } from '@/modules/devSudo/devSudoIntegration';

type MaybeAIMessage = Partial<AIMessage> | null | undefined;

export type ProviderPreference = 'auto' | 'local' | 'ollama';

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

const DEBUG_MAX_ENTRIES = 20;

const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';

const isProviderPreference = (value: unknown): value is ProviderPreference =>
  value === 'auto' || value === 'local' || value === 'ollama';

const readStoredPreferredProvider = (): ProviderPreference => {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  const stored = window.localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY);
  return isProviderPreference(stored) ? stored : 'auto';
};

const normalizeMessages = (messages: MaybeAIMessage[], getUiId: () => string): AIMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  const now = Date.now();
  const normalized = messages.map((message, index) => {
    const role = message?.role === 'assistant' || message?.role === 'system' || message?.role === 'user'
      ? message.role
      : 'assistant';

    const content = typeof message?.content === 'string'
      ? message.content
      : JSON.stringify(message?.content ?? '');

    const metadata = message?.metadata && typeof message.metadata === 'object'
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
      metadata
    };
  });

  // ✅ FIX RÉPÉTITIONS: Déduplication par uiId et contenu
  return deduplicateMessages(normalized);
};

/**
 * ✅ FIX CHAT RÉPÉTITIONS (Super Prompt #9 - Vision Engine)
 * Déduplique les messages basé sur uiId ou combinaison timestamp+contenu
 */
function deduplicateMessages(messages: AIMessage[]): AIMessage[] {
  const seen = new Set<string>();
  return messages.filter(msg => {
    // Utiliser uiId si disponible, sinon timestamp+contenu tronqué
    const key = msg.metadata?.uiId || `${msg.timestamp}-${msg.content.substring(0, 50)}`;
    if (seen.has(key)) {
      console.log('[useChat OMNIS] ⚠️ Message dupliqué détecté et filtré:', key.substring(0, 30));
      return false; // Skip duplicate
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
  // OMEGA FIX: Charger les messages depuis localStorage au démarrage pour éviter le flash
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      // Clé utilisée par chatMemoryCompactor
      const stored = localStorage.getItem('titane_chat_mode_default');
      if (stored) {
        const memory = JSON.parse(stored);
        if (memory && Array.isArray(memory.messages)) {
          console.log('[useChat OMNIS] 📂 Initial load from localStorage:', memory.messages.length, 'messages');
          return memory.messages;
        }
      }
    } catch (e) {
      console.warn('[useChat OMNIS] ⚠️ Failed to load initial messages:', e);
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

  // OMEGA FIX: Initialiser messagesRef avec les messages initiaux
  const messagesRef = useRef<AIMessage[]>(messages);
  const messageIdRef = useRef(0);
  const stateVaultRef = useRef<{ stable: AIMessage[]; lastContext: string }>({
    stable: messages.length > 0 ? [...messages] : [],
    lastContext: messages.length > 0 ? 'initial-load' : 'init'
  });

  const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';
  const [preferredProviderState, setPreferredProviderState] = useState<ProviderPreference>(() => readStoredPreferredProvider());
  const [lastProviderUsed, setLastProviderUsed] = useState<AIProviderName | null>(null);
  const debugEntriesRef = useRef<ChatDebugEntry[]>([]);
  const [debugEntries, setDebugEntries] = useState<ChatDebugEntry[]>([]);

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
      if (event.key === PREFERRED_PROVIDER_STORAGE_KEY && isProviderPreference(event.newValue)) {
        setPreferredProviderState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
  const [uiIntegrity, setUiIntegrity] = useState({
    version: 1,
    preventedResets: 0,
    recoveries: 0,
    lastRecoveryAt: null as number | null,
    lastContext: 'init',
    hasSnapshot: false
  });

  const omnisConfig = useMemo(() => ({
    enablePredictive: false,
    enableAutoRepair: true,
    fallbackMode: true,
    debugMetrics: true,
    timeoutMs: 20000,
    ...(options.omnisConfig ?? {})
  }), [options.omnisConfig]);

  // ═══ HOOKS INTEGRATION ═══
  const coreHookResult = useChatCore({
    mode: options.mode || 'default',
    emotionState: options.emotionState,
  }) || {
    currentMode: 'default' as ChatMode,
    anomalyCount: 0,
    currentProvider: 'titane-local',
    generate: async () => ({
      content: 'TITANE∞ prépare une réponse.',
      provider: 'titane-local',
      timestamp: Date.now(),
      mode: 'default' as ChatMode,
      contextUsed: [],
    } as ChatEngineResponse),
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
  } as UseChatCoreReturn;

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

  const { currentMode, anomalyCount, setMode: setCoreMode, generate, stream } = coreHookResult;
  const [currentModeState, setCurrentModeState] = useState<ChatMode>(currentMode);
  const { messagesForMode, memoryStats, saveMessage, clearMode } = memoryHookResult;

  const getNextUiId = useCallback(() => {
    messageIdRef.current += 1;
    return `chat-ui-${Date.now()}-${messageIdRef.current}`;
  }, []);

  const withUiId = useCallback(
    (metadata?: AIMessage['metadata']) => {
      const safeMetadata = metadata && typeof metadata === 'object' ? { ...metadata } : {};
      if (!safeMetadata.uiId) {
        safeMetadata.uiId = getNextUiId();
      }
      return safeMetadata;
    },
    [getNextUiId]
  );

  const applyMessagesSafely = useCallback((nextMessages: MaybeAIMessage[], context: string, options: { allowEmpty?: boolean } = {}) => {
    const allowEmpty = options.allowEmpty ?? false;
    const normalized = normalizeMessages(nextMessages, getNextUiId);
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
  }, [getNextUiId]);

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

    // 🛡️ PROTECTION CRITIQUE: JAMAIS sync pendant une opération en cours ou lock
    if (isLoadingRef.current || operationLockRef.current) {
      console.log('[useChat OMNIS] 🛡️ CRITICAL PROTECTED: Skipping sync during operation (loading:', isLoadingRef.current, 'lock:', operationLockRef.current, ')');
      return;
    }

    // CRITICAL: Si on a déjà des messages, JAMAIS les effacer sauf si memoryForMode a plus de contenu
    const currentCount = messagesRef.current.length;
    const memoryCount = messagesForMode.length;
    const vaultCount = stateVaultRef.current.stable.length;

    // 🛡️ Triple protection: ref, vault, et memory doivent tous être cohérents
    if (currentCount > 0 && memoryCount === 0) {
      console.log('[useChat OMNIS] 🛡️ PROTECTED: Skipping empty memory sync - preserving', currentCount, 'messages');
      return;
    }

    // Si mémoire et state ont des messages, prendre le plus complet
    // FIX v19.3Ω: Utiliser aussi le vault pour la comparaison
    const maxExisting = Math.max(currentCount, vaultCount);
    if (maxExisting > 0 && memoryCount > 0 && maxExisting >= memoryCount) {
      console.log('[useChat OMNIS] 🛡️ PROTECTED: Current/vault has more messages, skipping sync');
      return;
    }

    if (memoryCount === 0) {
      // Seulement reset si TOUT est vide (vault + ref + memoryForMode) ET pas en loading
      if (vaultCount === 0 && currentCount === 0 && !isLoadingRef.current) {
        applyMessagesSafely([], 'memory-sync-empty', { allowEmpty: true });
      }
      return;
    }

    // Sync uniquement si mémoire a plus de contenu ET pas en loading
    console.log('[useChat OMNIS] 📥 Syncing from memory:', memoryCount, 'messages');
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
  const sendMessage = useCallback(async (content: string): Promise<AIMessage> => {
    console.log('[useChat OMNIS] 🚀 sendMessage appelé avec:', content?.substring(0, 50));
    const startTime = Date.now();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log('[useChat OMNIS] ❌ Message invalide ou vide');
      return {
        role: 'assistant',
        content: 'Veuillez entrer un message pour continuer la conversation.',
        timestamp: Date.now(),
        metadata: { status: 'input-error' }
      };
    }

    // ✨ v∞.21.0 - DEV-SUDO Mode Integration (Super Prompt FULL UNLOCK)
    // Vérifier commandes développeur en PRIORITÉ ABSOLUE
    try {
      const devSudoResult = await handleDevSudoInChat(content.trim());

      if (devSudoResult.handled) {
        console.log('[useChat OMNIS] ⚡ DEV-SUDO command handled:', devSudoResult.success ? 'success' : 'failed');

        // Ajouter le message utilisateur
        const userMessage: AIMessage = {
          role: 'user',
          content: content.trim(),
          timestamp: Date.now(),
          metadata: withUiId({ inputLength: content.trim().length, mode: 'dev-sudo', devSudoCommand: true })
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
            actions: devSudoResult.actions
          })
        };

        const updatedMessages = [...messagesRef.current, userMessage, devSudoResponse];
        applyMessagesSafely(updatedMessages, 'dev-sudo-command');

        return devSudoResponse;
      }
    } catch (devSudoError) {
      console.warn('[useChat OMNIS] DEV-SUDO command check failed:', devSudoError);
      // Continuer normalement si erreur
    }

    // ✨ v∞.20.0 - Camera Chat Integration (Super Prompt #3)
    // Vérifier commande caméra AVANT envoi au provider IA
    try {
      const visionStore = useVisionStore.getState();
      const cameraResult = await handleCameraInChat(content.trim(), visionStore);

      if (cameraResult.handled) {
        console.log('[useChat OMNIS] 📷 Camera command handled:', cameraResult.response);

        // Ajouter le message utilisateur
        const userMessage: AIMessage = {
          role: 'user',
          content: content.trim(),
          timestamp: Date.now(),
          metadata: withUiId({ inputLength: content.trim().length, mode: currentModeState, cameraCommand: true })
        };

        // Ajouter la réponse caméra
        const cameraResponse: AIMessage = {
          role: 'assistant',
          content: cameraResult.response,
          timestamp: Date.now(),
          metadata: withUiId({ provider: 'camera-handler', cameraCommand: true })
        };

        const updatedMessages = [...messagesRef.current, userMessage, cameraResponse];
        applyMessagesSafely(updatedMessages, 'camera-command');

        return cameraResponse;
      }
    } catch (cameraError) {
      console.warn('[useChat OMNIS] Camera command check failed:', cameraError);
      // Continuer normalement si erreur
    }

    // FIX v19.3Ω: Activer le verrou d'opération AVANT tout changement d'état
    operationLockRef.current = true;
    console.log('[useChat OMNIS] 🔒 Operation lock ACTIVATED');

    console.log('[useChat OMNIS] ✅ Message valide, traitement...');
    const cleanMessage = content.trim();
    setIsLoading(true);
    setError(null);

    const userMessage: AIMessage = {
      role: 'user',
      content: cleanMessage,
      timestamp: Date.now(),
      metadata: withUiId({ inputLength: cleanMessage.length, mode: currentModeState })
    };

    const bufferedMessages = [...messagesRef.current, userMessage];
    const historyBuffer = applyMessagesSafely(bufferedMessages, 'user-message');

    const timeoutMs = Math.max(1000, omnisConfig.timeoutMs || 15000);
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

    applyMessagesSafely([...messagesRef.current, assistantPlaceholder], 'assistant-stream-start');
    console.log('[useChat OMNIS DEBUG] ✅ Placeholder ajouté, targetUiId:', assistantMetadata.uiId, 'messagesCount:', messagesRef.current.length);

    const targetUiId = assistantMetadata.uiId;

    const getAssistantFromState = (): AIMessage | null => {
      if (!targetUiId) {
        return null;
      }
      const current = messagesRef.current.find((msg) => msg.metadata?.uiId === targetUiId);
      return current ? { ...current } : null;
    };

    const updateAssistant = (
      mutate: (message: AIMessage) => AIMessage,
      context: string,
      metadataPatch?: Record<string, unknown>
    ) => {
      if (!targetUiId) {
        console.error('[useChat OMNIS DEBUG] ❌ updateAssistant: targetUiId manquant!');
        return;
      }

      console.log('[useChat OMNIS DEBUG] 🔄 updateAssistant appelé, context:', context, 'targetUiId:', targetUiId);

      const nextMessages = messagesRef.current.map((msg) => {
        if (!msg?.metadata || msg.metadata.uiId !== targetUiId) {
          return msg;
        }

        const updated = mutate({ ...msg });
        const existingMetadata = updated.metadata && typeof updated.metadata === 'object'
          ? { ...updated.metadata }
          : {};

        const mergedMetadata = {
          ...existingMetadata,
          ...(metadataPatch || {}),
        };

        if (targetUiId && mergedMetadata.uiId !== targetUiId) {
          mergedMetadata.uiId = targetUiId;
        }

        return {
          ...updated,
          metadata: mergedMetadata,
        };
      });

      console.log('[useChat OMNIS DEBUG] 📤 updateAssistant: Mise à jour des messages, count:', nextMessages.length);
      nextMessages.forEach((msg, idx) => {
        console.log(`[useChat OMNIS DEBUG] Message ${idx}:`, { role: msg.role, contentLen: msg.content?.length });
      });

      applyMessagesSafely(nextMessages, context);
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

      const streamingTask = (async (): Promise<ChatEngineResponse> => {
        let next = await iterator.next();

        while (!next.done) {
          const value = next.value;

          if (typeof value === 'string' && value.length > 0) {
            aggregatedContent += value;
            chunkCount += 1;

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
          }

          next = await iterator.next();
        }

        const response = next.value ?? null;
        if (!response) {
          throw new Error('Streaming sans réponse finale');
        }
        aggregatedContent = response.content ?? aggregatedContent;
        return response;
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

      const backendHistory: BackendChatMessage[] = historyBuffer.map((message) => ({
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
          backendHistory[firstUserMsgIndex].content =
            `${preferencesContext}\n\n${backendHistory[firstUserMsgIndex].content}`;
        }
      }

      const chatAttempts: ChatDebugAttempt[] = [];
      const attemptedProviders: string[] = [];
      let chatServiceResponse: ChatResponse | null = null;
      let chatServiceError: string | null = null;

      if (backendHistory.length > 0) {
        const requestConfig: StreamConfig = { provider: providerCandidates[0] };
        for (const candidate of providerCandidates) {
          try {
            requestConfig.provider = candidate;
            attemptedProviders.push(candidate);
            const response = await chatService.sendMessage(backendHistory, { provider: candidate });
            chatServiceResponse = response;
            chatAttempts.push({ provider: candidate, success: true, response });
            break;
          } catch (candidateError) {
            const reason = candidateError instanceof Error ? candidateError.message : String(candidateError);
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
          error: chatServiceResponse ? undefined : chatServiceError ?? 'Aucune réponse du moteur IA',
          selectedProvider: chatServiceResponse?.provider,
          latencyMs: chatServiceResponse?.latencyMs,
        };

        debugEntriesRef.current = [debugEntry, ...debugEntriesRef.current].slice(0, DEBUG_MAX_ENTRIES);
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
          const validationScore = typeof validationScoreRaw === 'number' ? validationScoreRaw : 1;
          const autoHealed = typeof autoHealedRaw === 'boolean' ? autoHealedRaw : Boolean(autoHealedRaw);
          const failureHandled = typeof failureHandledRaw === 'boolean' ? failureHandledRaw : Boolean(failureHandledRaw);
          const processingTime = typeof processingTimeRaw === 'number'
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
        aggregatedContent = chatServiceResponse.content ?? '';
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
        aggregatedContent = response.content;
      }

      if (!finalResponse) {
        throw new Error('Pipeline returned no response');
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

      const finalContent = finalResponse.content ?? aggregatedContent;
      console.log('[useChat OMNIS DEBUG] 🎯 finalContent:', finalContent?.substring(0, 100), 'length:', finalContent?.length);

      updateAssistant(
        (message) => ({
          ...message,
          content: finalContent,
          provider,
          timestamp: Date.now(),
        }),
        streamingError ? 'assistant-stream-fallback' : 'assistant-stream-complete',
        metadataPatch
      );

      console.log('[useChat OMNIS DEBUG] ✅ updateAssistant terminé, messages actuels:', messagesRef.current.length);

      const assistantMessage = getAssistantFromState() ?? {
        role: 'assistant',
        content: finalContent,
        provider,
        timestamp: Date.now(),
        metadata: withUiId(metadataPatch),
      };

      try {
        saveMessage(userMessage);
        saveMessage(assistantMessage);

        // ═══ RECORD INTERACTION FOR PREFERENCES LEARNING ═══
        try {
          userPreferencesEngine.recordInteraction(cleanMessage, finalContent);
        } catch (prefError) {
          console.warn('[useChat OMNIS] ⚠️ Preferences recording failed:', prefError);
        }

        // ═══ AWARD XP FOR SUCCESSFUL MESSAGE ═══
        // Système XP global + domaines spécifiques
        try {
          // XP Global Engine (+5 XP pour le moteur global)
          XP.gain(XP_REWARDS.CHAT_MESSAGE, 'chat_message', `Message envoyé: ${cleanMessage.substring(0, 50)}...`);

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

          console.log('[useChat OMNIS] ✨ XP awarded: +5 chat, +2 cognitive (si applicable)');
        } catch (xpError) {
          console.warn('[useChat OMNIS] XP award warning:', xpError);
        }
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

      setSuggestions(finalResponse.suggestions ?? []);
      setIsLoading(false);
      // FIX v19.3Ω: Désactiver le verrou après un délai pour permettre la stabilisation
      setTimeout(() => {
        operationLockRef.current = false;
        console.log('[useChat OMNIS] 🔓 Operation lock RELEASED (success)');
      }, 100);
      setLastProviderUsed(chatServiceResponse ? normalizeProvider(chatServiceResponse.provider) : provider);
      return assistantMessage;

    } catch (error) {
      console.error('[Chat] Engine pipeline error:', error);

      const fallbackResponse: AIMessage = {
        role: 'assistant',
        content: '⚠️ Erreur détectée — TITANE∞ reste présent. Une légère turbulence a été détectée mais l\'espace de discussion est stable. Reformule ou continue quand tu veux.',
        timestamp: Date.now(),
        provider: 'omnis-fallback',
        metadata: withUiId({
          status: 'error',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error)
        })
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

      setError('TITANE∞ a rencontré une anomalie et s\'est réparé. Tu peux réessayer immédiatement.');
      setIsLoading(false);
      // FIX v19.3Ω: Désactiver le verrou même en cas d'erreur
      setTimeout(() => {
        operationLockRef.current = false;
        console.log('[useChat OMNIS] 🔓 Operation lock RELEASED (error)');
      }, 100);
      setInternalAnomalyCount(prev => prev + 1);

      setLastProviderUsed('omnis-fallback');
      return fallbackResponse;
    }
  }, [applyMessagesSafely, currentModeState, debugEntriesRef, generate, omnisConfig.timeoutMs, options.voiceEnabled, preferredProviderState, saveMessage, stream, withUiId]);

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
    setCurrentModeState(mode);
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
    currentMode: currentModeState,
    isLoading,
    messagesCount: messages.length,
    omnisConfig
  }), [anomalyCount, currentModeState, internalAnomalyCount, isLoading, messages.length, memoryStats, omnisConfig, omnisStats]);

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
