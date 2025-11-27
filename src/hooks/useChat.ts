/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.20 — USE CHAT (Composition Hook)
 *   Hook composé : Orchestre useChatCore, useChatUI, useChatMemory
 *   v24.20: Optimisé avec cache et debouncing
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
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  USE CHAT v15: Initialization (Composition Hook)           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // FIX v15.1: Charger l'historique une seule fois au mount (mode initial)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const history = messagesForMode;
      if (history.length > 0) {
        addMessages(history);
        console.log(`✅ Initial load: ${history.length} messages from memory (mode: ${currentMode})`);
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
   * v24.20: Envoie message avec cache + debounce
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // v24.20: Debounce 300ms (évite spam)
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 300) {
        console.log(`⏸️ USE CHAT v24.20: Debounced (${timeSinceLastRequest}ms since last request)`);
        return;
      }
      lastRequestTime.current = now;

      console.log('\n═════════════════════════════════════════════════════════════');
      console.log('💬 USE CHAT v24.20: Send message start (cached + debounced)');
      console.log(`📝 Content: "${content.substring(0, 60)}..."`);
      console.log(`🎯 Mode: ${currentMode}`);
      console.log('═════════════════════════════════════════════════════════════\n');

      setError(null);
      setIsLoading(true);

      // FIX v15.1: Sauvegarder le nombre de messages AVANT ajout (pour vérification post-IA)
      const messagesCountBefore = messages.length;

      // Ajoute message utilisateur
      const userMessage: AIMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      saveMessage(userMessage); // Sync backend
      console.log(`✅ User message added + saved (total: ${messagesCountBefore + 1})`);

      try {
        // v24.20: Check cache first
        const cacheKey = getCacheKey(content.trim(), currentMode);
        let response: ChatEngineResponse;

        if (responseCache.current.has(cacheKey)) {
          response = responseCache.current.get(cacheKey)!;
          console.log('🎯 USE CHAT v24.20: Cache HIT (skipping AI call)');
        } else {
          // Génération IA (timeout 30s géré dans useChatCore)
          console.log('🚀 Calling generate() [Cache MISS]...\n');
          response = await generate(content.trim(), messages);

          // Store in cache (LRU: limit to 100 entries)
          if (responseCache.current.size >= 100) {
            const firstKey = responseCache.current.keys().next().value;
            responseCache.current.delete(firstKey);
          }
          responseCache.current.set(cacheKey, response);
          console.log(`💾 Cached response (${responseCache.current.size}/100 entries)`);
        }

        console.log('\n✅ Response received');
        console.log(`📦 Content: ${response.content.length} chars`);
        console.log(`🏷️  Provider: ${response.provider}`);

        // Ajoute réponse IA
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: response.content,
          timestamp: response.timestamp || Date.now(),
        };

        addMessage(aiMessage);
        saveMessage(aiMessage); // Sync backend
        console.log(`✅ AI response added + saved (total: ${messagesCountBefore + 2})`);

        // FIX v15.1: GARDE-FOU - Vérifier que les messages n'ont pas été écrasés
        // Si le count est inférieur à avant + 2, c'est qu'il y a eu un reset involontaire
        setTimeout(() => {
          if (messages.length < messagesCountBefore + 2) {
            console.error(`🚨 CRITICAL: Messages were reset! Expected ${messagesCountBefore + 2}, got ${messages.length}`);
            console.error('🚨 This should NEVER happen after v15.1 fix');
            // Re-ajouter les messages si nécessaire (recovery)
            addMessage(userMessage);
            addMessage(aiMessage);
          }
        }, 100); // Check après render

        // Suggestions
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
          console.log(`💡 ${response.suggestions.length} suggestions available`);
        }

        // Attribution XP (+5 par message)
        await awardXP('chat', 5, content.trim().length, response.provider);

        // Synthèse vocale si activée
        if (options.voiceEnabled && response.content) {
          console.log('🔊 TTS: Synthesizing response...');
          try {
            await hybridTTS.speak(response.content, { lang: 'fr-FR', rate: 1.0 });
            console.log('✅ TTS: Complete');
          } catch (ttsError) {
            console.warn('⚠️ TTS: Failed (non-blocking):', ttsError);
          }
        }

        console.log('\n═════════════════════════════════════════════════════════════');
        console.log('🎉 USE CHAT v24.20: Message processed successfully!');
        console.log('═════════════════════════════════════════════════════════════\n');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('\n❌ USE CHAT v24.20: Error', err);

        // Track error (SELFHEAL++)
        errorTracker.track('chat', errorMessage, 'high');

        // Check auto-reset
        const errorStats = errorTracker.getStats();
        if (errorStats.shouldReset) {
          console.warn('🚨 SELFHEAL++: Auto-reset triggered (3+ errors in 60s)');

          // Reset soft: clear mode actuel
          clearMode();
          clearMessages();
          setError('⚠️ Système réinitialisé automatiquement suite à des erreurs répétées');
          errorTracker.markReset();

          // Notification user
          const resetMessage: AIMessage = {
            role: 'assistant',
            content: '🔄 **Reset automatique TITANE∞**\n\nDes erreurs répétées ont été détectées. Le chat a été réinitialisé pour garantir un fonctionnement optimal.',
            timestamp: Date.now(),
          };
          addMessage(resetMessage);

          return;
        }

        setError(errorMessage);

        // Ajoute message d'erreur dans le chat
        const errorAiMessage: AIMessage = {
          role: 'assistant',
          content: `❌ Erreur: ${errorMessage}`,
          timestamp: Date.now(),
        };
        addMessage(errorAiMessage);
      } finally {
        setIsLoading(false);
        console.log('🔓 isLoading = false\n');
      }
    },
    [
      isLoading,
      currentMode,
      messages,
      options.voiceEnabled,
      generate,
      addMessage,
      saveMessage,
      setSuggestions,
      awardXP,
      clearMode,
      clearMessages,
      setError,
      setIsLoading,
      getCacheKey,
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
