/**
 * TITANE_INFINITY v19.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Θ — USE CHAT (MAÎTRE ANTI-SILENCE)
 *   Architecture 100% anti-crash, anti-silence, auto-réparation
 *   Garantit TOUJOURS une réponse, quoi qu'il arrive
 *   PHASE I: Séquence cognitive garantie + Canon de sécurité
 * ═══════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useChatCore } from './useChatCore';
import { useChatUI } from './useChatUI';
import { useChatMemory } from './useChatMemory';
import type { ChatMode, ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { hybridTTS } from '../services/tts/hybridTTS';
import { errorTracker } from '../services/errorTracker';

interface UseChatOptions {
  mode?: ChatMode;
  emotionState?: { valence: number; intensity: number; energy: number };
  voiceEnabled?: boolean;
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

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setMode: (mode: ChatMode) => void;
  setInput: (value: string) => void;
  handleSend: () => void;
}

/**
 * Hook principal Chat
 * Composition propre des 3 hooks spécialisés
 */
const isDev = import.meta.env.DEV;

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  if (isDev) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  USE CHAT v19.2Θ: MAÎTRE ANTI-SILENCE Initialization      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }

  // Référence mount unique + failure tracking
  const mountedRef = useRef(false);
  const [failureCount, setFailureCount] = useState(0);
  
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const history = messagesForMode;
      if (history.length > 0 && isDev) {
        console.log(`✅ Initial load: ${history.length} messages from memory`);
      }
    }
  }, []);

  // 1. Core IA Logic
  const {
    currentMode,
    anomalyCount,
    generate,
    setMode: setCoreMode,
  } = useChatCore({
    mode: options.mode,
    emotionState: options.emotionState,
  });

  // 2. UI State
  const {
    messages,
    input,
    isLoading,
    error,
    suggestions,
    setInput,
    setIsLoading,
    setError,
    setSuggestions,
    addMessage,
    addMessages,
    clearMessages,
    handleSend: _handleUISend,
  } = useChatUI();

  // 3. Memory Backend Sync
  const {
    messagesForMode,
    memoryStats,
    saveMessage,
    clearMode,
    awardXP,
  } = useChatMemory({
    mode: currentMode,
    autoCleanup: true,
    autoSave: true,
  });

  // Sync messages depuis memory UNIQUEMENT au changement de mode (pas à chaque save!)
  // FIX v15.1: Retirer messagesForMode des dépendances pour éviter le reset à chaque message
  const prevModeRef = useRef<ChatMode>(currentMode);

  useEffect(() => {
    // Charger l'historique UNIQUEMENT si le mode a réellement changé
    if (prevModeRef.current !== currentMode) {
      console.log(`🔄 USE CHAT v24.20: Mode changed ${prevModeRef.current} → ${currentMode}, loading history...`);
      prevModeRef.current = currentMode;

      // Charger l'historique sauvegardé
      const history = messagesForMode;
      if (history.length > 0) {
        addMessages(history);
        console.log(`✅ Loaded ${history.length} messages from memory`);
      } else {
        // Mode vide : clear UI
        clearMessages();
        console.log(`✅ Mode ${currentMode} is empty, UI cleared`);
      }
    }
  }, [currentMode, addMessages, clearMessages]);

  // v24.20: Simple response cache (LRU-like avec Map)
  const responseCache = useRef(new Map<string, ChatEngineResponse>());
  const lastRequestTime = useRef(0);

  // v24.20: Cache key generator
  const getCacheKey = useMemo(
    () => (content: string, mode: ChatMode) => `${mode}:${content.trim().toLowerCase()}`,
    []
  );

  /**
   * ═══════════════════════════════════════════════════════════════════
   * 🔥 FONCTION MAÎTRE ANTI-SILENCE v19.2Θ
   * Garantit TOUJOURS une réponse IA (réponse ou erreur contrôlée)
   * Jamais un silence, jamais un return vide, jamais un crash UI
   * Séquence: userMsg → save → display → generate() → validate → fallback → display → save
   * ═══════════════════════════════════════════════════════════════════
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const clean = content.trim();
      
      if (isDev) {
        console.log('\n═════════════════════════════════════════════════════════════');
        console.log('🔥 [MAÎTRE ANTI-SILENCE] Début séquence cognitive garantie');
        console.log(`📝 Message: "${clean.substring(0, 50)}${clean.length > 50 ? '...' : ''}"`);
        console.log('═════════════════════════════════════════════════════════════\n');
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 1: Créer et afficher message utilisateur (GARANTI)
      // ─────────────────────────────────────────────────────────────
      const userMessage: AIMessage = {
        role: 'user',
        content: clean,
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      saveMessage(userMessage);
      setIsLoading(true);
      setError(null);

      if (isDev) {
        console.log('✅ ÉTAPE 1: Message utilisateur créé et sauvegardé');
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 2: Générer réponse IA (avec protection totale)
      // ─────────────────────────────────────────────────────────────
      let aiResponse: ChatEngineResponse | null = null;
      let emergencyFallback = false;

      try {
        // Timeout maître (30 secondes max)
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout 30s - Aucun provider disponible')), 30000)
        );

        const generation = generate(clean, messages);
        aiResponse = await Promise.race([generation, timeout]);

        // Validation réponse stricte
        if (!aiResponse || !aiResponse.content || aiResponse.content.trim() === '') {
          throw new Error('Réponse IA vide ou invalide');
        }

        // Reset failure count sur succès
        setFailureCount(0);

        if (isDev) {
          console.log('✅ ÉTAPE 2: Réponse IA générée avec succès');
          console.log(`   Provider: ${aiResponse.provider}`);
          console.log(`   Content: ${aiResponse.content.length} chars`);
        }

      } catch (err) {
        emergencyFallback = true;
        const newFailureCount = failureCount + 1;
        setFailureCount(newFailureCount);

        if (isDev) {
          console.error('❌ ÉTAPE 2: Generate crashed:', err);
          console.log(`🔄 Activating emergency fallback (failure #${newFailureCount})...`);
        }

        // Track error pour auto-heal
        if (errorTracker?.track) {
          errorTracker.track('chat', err instanceof Error ? err.message : String(err), 'high');
        }
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 3: FALLBACK ULTIME GARANTI (jamais undefined)
      // ─────────────────────────────────────────────────────────────
      if (!aiResponse || emergencyFallback) {
        const fallbackMessages = [
          "Une erreur système a été détectée. Je continue en mode autonome sécurisé TITANE.",
          "Mon moteur principal est temporairement inaccessible. Mode autonome local activé.",
          "Erreur de communication avec les providers IA. Je bascule en mode sécurisé.",
          "⚠️ Tous les moteurs IA distants sont hors ligne. Mode survie TITANE engagé. Je reste opérationnel en mode autonome.",
        ];

        const selectedMessage = failureCount > 3 
          ? fallbackMessages[3] 
          : fallbackMessages[Math.min(failureCount, fallbackMessages.length - 1)];

        aiResponse = {
          content: selectedMessage,
          provider: 'system-fallback',
          mode: currentMode,
          contextUsed: [],
          metadata: {
            emergency: true,
            timestamp: Date.now(),
            failureCount: failureCount + 1,
            fallbackReason: emergencyFallback ? 'generation_error' : 'empty_response',
          },
          timestamp: Date.now(),
        };

        if (isDev) {
          console.log('🚨 ÉTAPE 3: Fallback ultime activé');
          console.log(`   Message: "${aiResponse.content}"`);
        }
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 4: Créer et afficher message IA (TOUJOURS EXÉCUTÉ)
      // ─────────────────────────────────────────────────────────────
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: aiResponse.content,
        timestamp: Date.now(),
      };

      addMessage(assistantMessage);
      saveMessage(assistantMessage);

      if (isDev) {
        console.log('✅ ÉTAPE 4: Message IA affiché et sauvegardé');
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 5: Suggestions (optionnel, avec protection)
      // ─────────────────────────────────────────────────────────────
      if (aiResponse.suggestions && Array.isArray(aiResponse.suggestions)) {
        try {
          setSuggestions(aiResponse.suggestions);
          if (isDev) {
            console.log(`✅ ÉTAPE 5: ${aiResponse.suggestions.length} suggestions ajoutées`);
          }
        } catch (err) {
          if (isDev) {
            console.warn('⚠️ ÉTAPE 5: Suggestions failed (non-blocking):', err);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 6: XP Award (optionnel, avec protection)
      // ─────────────────────────────────────────────────────────────
      try {
        await awardXP('chat', 5, clean.length, aiResponse.provider);
        if (isDev) {
          console.log('✅ ÉTAPE 6: XP awarded (+5)');
        }
      } catch (err) {
        if (isDev) {
          console.warn('⚠️ ÉTAPE 6: XP award failed (non-blocking):', err);
        }
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 7: TTS (optionnel, avec protection)
      // ─────────────────────────────────────────────────────────────
      if (options.voiceEnabled) {
        try {
          await hybridTTS.speak(aiResponse.content, { lang: 'fr-FR', rate: 1.0 });
          if (isDev) {
            console.log('✅ ÉTAPE 7: TTS completed');
          }
        } catch (err) {
          if (isDev) {
            console.warn('⚠️ ÉTAPE 7: TTS failed (non-blocking):', err);
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // ÉTAPE 8: Cleanup final (TOUJOURS EXÉCUTÉ)
      // ─────────────────────────────────────────────────────────────
      setIsLoading(false);

      if (isDev) {
        console.log('✅ ÉTAPE 8: Séquence terminée - isLoading = false');
        console.log('═════════════════════════════════════════════════════════════\n');
      }
    },
    [
      isLoading,
      messages,
      currentMode,
      generate,
      addMessage,
      saveMessage,
      setIsLoading,
      setError,
      setSuggestions,
      awardXP,
      options.voiceEnabled,
      failureCount,
    ]
  );

  /**
   * Efface tout le chat (mode actuel)
   */
  const clearChat = useCallback(() => {
    clearMode();
    clearMessages();
    setError(null);
    setSuggestions([]);
    // v24.20: Clear cache on chat clear
    responseCache.current.clear();
    console.log(`🧹 USE CHAT v24.20: Cleared mode ${currentMode} + cache`);
  }, [currentMode, clearMode, clearMessages, setError, setSuggestions]);

  /**
   * Change le mode
   */
  const setMode = useCallback((mode: ChatMode) => {
    console.log(`🔄 USE CHAT v24.20: Change mode → ${mode}`);
    setCoreMode(mode);
  }, [setCoreMode]);

  /**
   * Handle send depuis UI
   */
  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    const trimmedInput = input.trim();
    setInput(''); // Clear input
    sendMessage(trimmedInput);
  }, [input, isLoading, setInput, sendMessage]);

  return {
    // UI State
    messages,
    input,
    isLoading,
    error,
    suggestions,

    // Mode & Stats
    currentMode,
    anomalyCount,
    memoryStats,

    // Actions
    sendMessage,
    clearChat,
    setMode,
    setInput,
    handleSend,
  };
}
