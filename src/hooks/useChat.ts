/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — USE CHAT HOOK (REFACTORED)
 *   Hook React pour Chat IA avec ChatEngine unifié + Memory Core
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import {
  loadChatHistory,
  addMessageToHistory,
  clearChatHistory as clearHistoryStorage,
} from '../services/chatMemory';
import { hybridTTS } from '../services/tts/hybridTTS';
import { awardExperience } from '../services/experienceService';
import { XPSource } from '../types/experience';

interface UseChatOptions {
  mode?: ChatMode;
  emotionState?: { valence: number; intensity: number; energy: number };
  voiceEnabled?: boolean; // Active la synthèse vocale des réponses
}

interface UseChatReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  currentMode: ChatMode;
  suggestions: string[];
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setMode: (mode: ChatMode) => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<ChatMode>(options.mode || 'default');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Charge l'historique au montage
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Configure le mode dans chatEngine
  useEffect(() => {
    chatEngine.setMode(currentMode, {
      emotionState: options.emotionState,
    });
  }, [currentMode, options.emotionState]);

  // Envoie un message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    console.log('\n═════════════════════════════════════════════════════════════');
    console.log('💬 USE CHAT: Sending new message');
    console.log(`📝 Content: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`);
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

    const updatedMessages = addMessageToHistory(userMessage);
    setMessages([...updatedMessages]);
    console.log('✅ User message added to history');

    try {
      console.log('🚀 Calling chatEngine.generate()...\n');

      // Timeout safety: 10s max (réduit pour dev rapide)
      const generatePromise = chatEngine.generate(content.trim(), updatedMessages);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Chat engine took >10s')), 10000)
      );

      const response: ChatEngineResponse = await Promise.race([
        generatePromise,
        timeoutPromise
      ]);

      console.log('\n✅ Response received from chatEngine');
      console.log(`📦 Content length: ${response.content.length} chars`);
      console.log(`🏷️  Provider: ${response.provider}`);

      // Ajoute réponse IA
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
      };

      const finalMessages = addMessageToHistory(aiMessage);
      setMessages([...finalMessages]);
      console.log('✅ AI response added to history');

      // Attribution XP pour message chat (+5 XP)
      try {
        await awardExperience('chat', 5, XPSource.ChatMessage, {
          messageLength: content.trim().length,
          provider: response.provider,
        });
        console.log('✨ +5 XP awarded to Chat domain');
      } catch (xpError) {
        console.warn('⚠️ XP award failed (non-blocking):', xpError);
      }

      // Met à jour suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        console.log(`💡 ${response.suggestions.length} suggestions available`);
      }

      // Synthèse vocale si activée
      if (options.voiceEnabled && response.content) {
        console.log('🔊 TTS: Voice mode enabled, synthesizing response...');
        try {
          await hybridTTS.speak(response.content, { lang: 'fr-FR', rate: 1.0 });
          console.log('✅ TTS: Synthesis complete');
        } catch (ttsError) {
          console.warn('⚠️ TTS: Synthesis failed (non-blocking):', ttsError);
          // TTS échoue silencieusement, n'affecte pas le chat
        }
      }

      console.log('\n═════════════════════════════════════════════════════════════');
      console.log('🎉 USE CHAT: Message processed successfully!');
      console.log('═════════════════════════════════════════════════════════════\n');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('\n❌ USE CHAT: Error occurred');
      console.error('Error:', err);
      console.error('═════════════════════════════════════════════════════════════\n');

      setError(errorMessage);

      // Ajoute message d'erreur dans le chat
      const errorAiMessage: AIMessage = {
        role: 'assistant',
        content: `❌ Erreur: ${errorMessage}`,
        timestamp: Date.now(),
      };

      const finalMessages = addMessageToHistory(errorAiMessage);
      setMessages([...finalMessages]);
    } finally {
      setIsLoading(false);
      console.log('🔓 isLoading set to false\n');
    }
  }, [isLoading, currentMode, options.voiceEnabled]);

  // Efface tout le chat
  const clearChat = useCallback(() => {
    clearHistoryStorage();
    setMessages([]);
    setError(null);
    setSuggestions([]);
  }, []);

  // Change le mode de travail
  const setMode = useCallback((mode: ChatMode) => {
    setCurrentMode(mode);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentMode,
    suggestions,
    sendMessage,
    clearChat,
    setMode,
  };
}
