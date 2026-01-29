/**
 * TITANE∞ — Message Reactions Service
 * Gère les réactions aux messages (👍👎❤️)
 *
 * v26.4.0 (Sprint 6 Phase 3)
 */

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type ReactionType = 'thumbsup' | 'thumbsdown' | 'heart' | 'laugh' | 'thinking';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  thumbsup: '👍',
  thumbsdown: '👎',
  heart: '❤️',
  laugh: '😂',
  thinking: '🤔',
};

export interface MessageReaction {
  messageTimestamp: number;
  reactions: Partial<Record<ReactionType, number>>;
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════

class MessageReactionsService {
  private readonly STORAGE_KEY = 'titane_message_reactions';
  private reactionsCache: Map<number, Partial<Record<ReactionType, number>>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Charge les réactions depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as MessageReaction[];
        data.forEach(item => {
          this.reactionsCache.set(item.messageTimestamp, item.reactions);
        });
      }
    } catch (error) {
      console.error('[MessageReactions] Error loading from storage:', error);
    }
  }

  /**
   * Sauvegarde les réactions dans localStorage
   */
  private saveToStorage(): void {
    try {
      const data: MessageReaction[] = Array.from(this.reactionsCache.entries()).map(
        ([timestamp, reactions]) => ({
          messageTimestamp: timestamp,
          reactions,
        })
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[MessageReactions] Error saving to storage:', error);
    }
  }

  /**
   * Ajoute ou retire une réaction
   */
  toggleReaction(messageTimestamp: number, reaction: ReactionType): void {
    const current = this.reactionsCache.get(messageTimestamp) || {};
    const count = current[reaction] || 0;

    if (count > 0) {
      // Retirer la réaction
      current[reaction] = 0;
      // Nettoyer si plus de réactions
      if (Object.values(current).every(c => c === 0)) {
        this.reactionsCache.delete(messageTimestamp);
      }
    } else {
      // Ajouter la réaction
      current[reaction] = 1;
      this.reactionsCache.set(messageTimestamp, current);
    }

    this.saveToStorage();
  }

  /**
   * Obtient les réactions pour un message
   */
  getReactions(messageTimestamp: number): Partial<Record<ReactionType, number>> {
    return this.reactionsCache.get(messageTimestamp) || {};
  }

  /**
   * Obtient toutes les réactions
   */
  getAllReactions(): Map<number, Partial<Record<ReactionType, number>>> {
    return new Map(this.reactionsCache);
  }

  /**
   * Efface toutes les réactions
   */
  clearAll(): void {
    this.reactionsCache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Efface les réactions pour un message
   */
  clearForMessage(messageTimestamp: number): void {
    this.reactionsCache.delete(messageTimestamp);
    this.saveToStorage();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════

let reactionsServiceInstance: MessageReactionsService | null = null;

export function getReactionsService(): MessageReactionsService {
  if (!reactionsServiceInstance) {
    reactionsServiceInstance = new MessageReactionsService();
  }
  return reactionsServiceInstance;
}

export default MessageReactionsService;
