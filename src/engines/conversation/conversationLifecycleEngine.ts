/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — CONVERSATION LIFECYCLE ENGINE (Ring 2)
 *   Gestion du cycle de vie des conversations multiples
 *   Architecture: Ring 1 (Types) → Ring 2 (Engine) → Ring 3 (Services)
 * ═══════════════════════════════════════════════════════════════════
 */

import type {
  Conversation,
  ConversationSummary,
  CreateConversationOptions,
  ConversationLifecycleEvent,
} from '@/types/conversation';
import type { AIMessage } from '@/types/ai';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ConversationLifecycleEngine');

/**
 * Générateur de titres à partir du premier message utile
 */
function generateTitle(messages: AIMessage[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    const content = firstUserMessage.content.trim();
    // Extraire les premiers mots (max 50 chars)
    const preview = content.length > 50 ? content.substring(0, 47) + '...' : content;
    return preview;
  }
  return `Conversation ${new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`;
}

/**
 * Engine de gestion du lifecycle des conversations
 *
 * Responsabilités:
 * - Création de conversations
 * - Activation/désactivation
 * - Gestion des messages
 * - Archivage
 *
 * Règles:
 * - Une seule conversation active à la fois
 * - Si aucune conversation n'existe → en créer une automatiquement
 * - Changer de conversation ≠ reset global du système
 */
export class ConversationLifecycleEngine {
  private activeConversationId: string | null = null;
  private eventListeners: Array<(event: ConversationLifecycleEvent) => void> = [];

  constructor() {
    logger.info('ConversationLifecycleEngine initialized');
  }

  /**
   * Créer une nouvelle conversation
   */
  createConversation(options: CreateConversationOptions = {}): Conversation {
    const now = Date.now();
    const id = `conv-${now}-${Math.random().toString(36).substring(7)}`;

    const conversation: Conversation = {
      id,
      title: options.title || 'Nouvelle conversation',
      messages: [],
      status: 'active',
      created_at: now,
      updated_at: now,
      mode: options.mode,
      metadata: options.metadata,
    };

    this.emitEvent({
      type: 'conversation.created',
      conversation_id: id,
      timestamp: now,
      data: { title: conversation.title, mode: options.mode },
    });

    logger.info('Conversation created', { id, title: conversation.title });
    return conversation;
  }

  /**
   * Définir la conversation active
   */
  setActiveConversation(conversationId: string): void {
    if (this.activeConversationId === conversationId) {
      return; // Déjà active
    }

    this.activeConversationId = conversationId;

    this.emitEvent({
      type: 'conversation.activated',
      conversation_id: conversationId,
      timestamp: Date.now(),
    });

    logger.info('Active conversation changed', { conversationId });
  }

  /**
   * Obtenir l'ID de la conversation active
   */
  getActiveConversation(): string | null {
    return this.activeConversationId;
  }

  /**
   * Ajouter un message à une conversation
   * Note: Cette méthode ne modifie pas directement la conversation en mémoire,
   * elle émet un event pour que le service de persistance (Ring 3) le gère.
   */
  appendMessage(conversationId: string, message: AIMessage): void {
    this.emitEvent({
      type: 'conversation.message.appended',
      conversation_id: conversationId,
      timestamp: Date.now(),
      data: { message },
    });

    logger.debug('Message appended', { conversationId, role: message.role });
  }

  /**
   * Archiver une conversation
   */
  archiveConversation(conversationId: string): void {
    this.emitEvent({
      type: 'conversation.archived',
      conversation_id: conversationId,
      timestamp: Date.now(),
    });

    // Si c'était la conversation active, la désactiver
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }

    logger.info('Conversation archived', { conversationId });
  }

  /**
   * Générer ou mettre à jour le titre d'une conversation
   */
  updateConversationTitle(conversation: Conversation): string {
    if (conversation.messages.length === 0) {
      return conversation.title;
    }

    const newTitle = generateTitle(conversation.messages);

    if (newTitle !== conversation.title) {
      this.emitEvent({
        type: 'conversation.updated',
        conversation_id: conversation.id,
        timestamp: Date.now(),
        data: { title: newTitle },
      });
    }

    return newTitle;
  }

  /**
   * Écouter les événements de lifecycle
   */
  addEventListener(listener: (event: ConversationLifecycleEvent) => void): () => void {
    this.eventListeners.push(listener);

    // Retourner fonction de cleanup
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Émettre un événement
   */
  private emitEvent(event: ConversationLifecycleEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        logger.error('Event listener error', error);
      }
    }
  }

  /**
   * Créer un résumé de conversation
   */
  createSummary(conversation: Conversation): ConversationSummary {
    return {
      id: conversation.id,
      title: conversation.title,
      status: conversation.status,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      message_count: conversation.messages.length,
      mode: conversation.mode,
    };
  }

  /**
   * Valider qu'une conversation peut recevoir des messages
   */
  canReceiveMessages(conversationId: string | null): boolean {
    if (!conversationId) {
      logger.warn('No conversation ID provided');
      return false;
    }

    if (conversationId !== this.activeConversationId) {
      logger.warn('Conversation is not active', {
        conversationId,
        active: this.activeConversationId,
      });
      return false;
    }

    return true;
  }

  /**
   * Reset (pour tests uniquement)
   */
  reset(): void {
    this.activeConversationId = null;
    this.eventListeners = [];
    logger.info('Engine reset');
  }
}

// Singleton instance
export const conversationLifecycle = new ConversationLifecycleEngine();
