/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — USE CHAT (Composition Hook)
 *   Hook composé : Orchestre useChatCore, useChatUI, useChatMemory
 * ═══════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect } from 'react';
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
  console.log('║  USE CHAT v14: Initialization (Composition Hook)           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

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

  // Sync messages depuis memory au changement de mode
  useEffect(() => {
    console.log(`🔄 USE CHAT v14: Mode changed to ${currentMode}, loading history...`);
    addMessages(messagesForMode);
  }, [currentMode, messagesForMode]);

  /**
   * Envoie message (orchestration complète)
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      console.log('\n═════════════════════════════════════════════════════════════');
      console.log('💬 USE CHAT v14: Send message start');
      console.log(`📝 Content: "${content.substring(0, 60)}..."`);
      console.log(`🎯 Mode: ${currentMode}`);
      console.log('═════════════════════════════════════════════════════════════\n');

      setError(null);
      setIsLoading(true);

      // Ajoute message utilisateur
      const userMessage: AIMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      saveMessage(userMessage); // Sync backend
      console.log(`✅ User message added + saved`);

      try {
        // Génération IA (timeout 30s géré dans useChatCore)
        console.log('🚀 Calling generate()...\n');
        const response: ChatEngineResponse = await generate(content.trim(), messages);

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
        console.log(`✅ AI response added + saved`);

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
        console.log('🎉 USE CHAT v14: Message processed successfully!');
        console.log('═════════════════════════════════════════════════════════════\n');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('\n❌ USE CHAT v14: Error', err);

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
    console.log(`🧹 USE CHAT v14: Cleared mode ${currentMode}`);
  }, [currentMode, clearMode, clearMessages]);

  /**
   * Change le mode
   */
  const setMode = useCallback((mode: ChatMode) => {
    console.log(`🔄 USE CHAT v14: Change mode → ${mode}`);
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
