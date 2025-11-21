/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — CHAT MEMORY SERVICE (LOCAL FIRST)
 *   Gestion mémoire locale des conversations IA
 *   Storage: 100% localStorage - Aucune sync cloud par défaut
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage } from './aiService';

const STORAGE_KEY = 'titane_chat_history';
const MAX_MESSAGES = 100;

/**
 * Charge l'historique depuis localStorage
 */
export function loadChatHistory(): AIMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

/**
 * Sauvegarde l'historique dans localStorage
 */
export function saveChatHistory(messages: AIMessage[]): void {
  try {
    // Limite à MAX_MESSAGES pour éviter surcharge
    const limited = messages.slice(-MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

/**
 * Efface tout l'historique
 */
export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

/**
 * Ajoute un message à l'historique et sauvegarde
 */
export function addMessageToHistory(message: AIMessage): AIMessage[] {
  const history = loadChatHistory();
  const updated = [...history, message];
  saveChatHistory(updated);
  return updated;
}

/**
 * Récupère les N derniers messages (pour contexte IA)
 */
export function getRecentContext(count: number = 5): AIMessage[] {
  const history = loadChatHistory();
  return history.slice(-count);
}

export default {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  addMessageToHistory,
  getRecentContext,
};
