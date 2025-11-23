/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  LONG_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

/**
 * Message de conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  emotionState?: {
    valence: number;
    intensity: number;
    energy: number;
  };
}

/**
 * Configuration streaming
 */
export interface StreamConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Réponse chat
 */
export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  model: string;
}

/**
 * Service centralisé pour Chat IA
 * Remplace les appels invoke() dispersés
 */
class ChatService {
  /**
   * Envoi message avec réponse complète (non-streaming)
   */
  async sendMessage(
    messages: ChatMessage[],
    config?: StreamConfig
  ): Promise<ChatResponse> {
    try {
      return await invokeWithRetry<ChatResponse>(
        'chat_send_message',
        { messages, config: config || {} },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur sendMessage:', error);
      throw new Error(`Chat envoi échoué: ${error}`);
    }
  }

  /**
   * Envoi message avec streaming (callbacks)
   */
  async sendMessageStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void,
    config?: StreamConfig
  ): Promise<void> {
    try {
      // TODO: Implémenter streaming avec Tauri events
      // Pour l'instant, fallback sur réponse complète
      const response = await this.sendMessage(messages, config);
      onChunk(response.content);
      onComplete(response);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError(err);
    }
  }

  /**
   * Génération suggestions contextuelles
   */
  async generateSuggestions(
    context: string,
    mode: string,
    limit: number = 3
  ): Promise<string[]> {
    try {
      return await invokeWithRetry<string[]>(
        'chat_generate_suggestions',
        { context, mode, limit },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur suggestions:', error);
      return [];
    }
  }

  /**
   * Analyse émotion d'un message
   */
  async analyzeEmotion(message: string): Promise<{
    valence: number;
    intensity: number;
    energy: number;
    label: string;
  }> {
    try {
      return await invokeWithRetry(
        'chat_analyze_emotion',
        { message },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur analyse émotion:', error);
      // Fallback émotionnel neutre
      return {
        valence: 0,
        intensity: 0.5,
        energy: 0.5,
        label: 'neutre',
      };
    }
  }

  /**
   * Récupération historique conversation
   */
  async getHistory(limit: number = 50): Promise<ChatMessage[]> {
    try {
      return await invokeWithRetry<ChatMessage[]>(
        'chat_get_history',
        { limit },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur historique:', error);
      return [];
    }
  }

  /**
   * Effacement historique
   */
  async clearHistory(): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'chat_clear_history',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur effacement:', error);
      throw new Error(`Effacement échoué: ${error}`);
    }
  }

  /**
   * Recherche dans historique
   */
  async searchHistory(query: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      return await invokeWithRetry<ChatMessage[]>(
        'chat_search_history',
        { query, limit },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur recherche:', error);
      return [];
    }
  }

  /**
   * Export conversation (markdown/JSON)
   */
  async exportConversation(format: 'markdown' | 'json'): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'chat_export_conversation',
        { format },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur export:', error);
      throw new Error(`Export échoué: ${error}`);
    }
  }
}

/**
 * Instance singleton
 */
export const chatService = new ChatService();
