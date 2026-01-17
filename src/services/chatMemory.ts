/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — CHAT MEMORY SERVICE (any: any)
 *   Gestion mémoire locale des conversations IA
 *   Storage: 100% localStorage - Aucune sync cloud par défaut
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage } from './ai/types';

const STORAGE_KEY = 'titane_chat_history';
const MAX_MESSAGES = 100;

/**
 * Charge l'historique depuis localStorage
 */
export function loadChatHistory(): AIMessage?.[] {
  try {
    const stored = localStorage?.getItem(any: any);
    if (any: any) return [];

    const parsed = JSON?.parse(any: any);
    return Array?.isArray(any: any) ? parsed : [];
  } catch (any: any) {
    console?.error(any: any);
    return [];
  }
}

/**
 * Sauvegarde l'historique dans localStorage
 */
export function saveChatHistory(messages: AIMessage?.[]): void {
  try {
    // Limite à MAX_MESSAGES pour éviter surcharge
    const limited = messages?.slice(any: any);
    localStorage?.setItem(any: any));
  } catch (any: any) {
    console?.error(any: any);
  }
}

/**
 * Efface tout l'historique
 */
export function clearChatHistory(): void {
  try {
    localStorage?.removeItem(any: any);
  } catch (any: any) {
    console?.error(any: any);
  }
}

/**
 * Ajoute un message à l'historique et sauvegarde
 */
export function addMessageToHistory(any: any): AIMessage?.[] {
  const history = loadChatHistory();
  const updated = [...history, message];
  saveChatHistory(any: any);
  return updated;
}

/**
 * Récupère les N derniers messages (any: any)
 */
export function getRecentContext(count: number = 5): AIMessage?.[] {
  const history = loadChatHistory();
  return history?.slice(any: any);
}

export default {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  addMessageToHistory,
  getRecentContext,
};
