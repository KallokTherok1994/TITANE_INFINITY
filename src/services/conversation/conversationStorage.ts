/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — CONVERSATION STORAGE SERVICE (Ring 3)
 *   Persistance locale des conversations multiples
 *   Local-first • Append-only events • INDEX ULTIME vΩ compatible
 * ═══════════════════════════════════════════════════════════════════
 */

import type {
  Conversation,
  ConversationSummary,
  ConversationLifecycleEvent,
} from '@/types/conversation';
import type { AIMessage } from '@/types/ai';
import { createLogger } from '@/utils/logger';
import { conversationLifecycle } from '@/engines/conversation/conversationLifecycleEngine';
import { cleanupLegacyConversationKeys } from '@/services/conversation/legacyCleanup';

const logger = createLogger('ConversationStorage');

const STORAGE_KEY_PREFIX = 'titane_conversation_';
const STORAGE_KEY_ACTIVE = 'titane_active_conversation_id';
const STORAGE_KEY_INDEX = 'titane_conversations_index';
const EVENTS_KEY = 'titane_conversation_events';

/**
 * Service de stockage des conversations
 *
 * Architecture:
 * - Stockage localStorage (JSON)
 * - Index des conversations actives
 * - Log d'événements append-only (JSONL-like)
 *
 * Clés localStorage:
 * - titane_conversation_{id}: Conversation complète
 * - titane_conversations_index: Liste des IDs + metadata
 * - titane_active_conversation_id: ID de la conversation active
 * - titane_conversation_events: Log append-only des événements
 */
export class ConversationStorageService {
  private conversations: Map<string, Conversation> = new Map();
  private index: ConversationSummary[] = [];
  private initialized = false;

  constructor() {
    // Écouter les événements du lifecycle engine
    conversationLifecycle.addEventListener(event => this.handleLifecycleEvent(event));
  }

  /**
   * Initialiser le service (charger depuis localStorage)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // PHASE 3: Cleanup legacy keys before loading
      cleanupLegacyConversationKeys();

      // Charger l'index
      const indexData = localStorage.getItem(STORAGE_KEY_INDEX);
      if (indexData) {
        this.index = JSON.parse(indexData);
        logger.info('Conversations index loaded', { count: this.index.length });
      }

      // Charger la conversation active
      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (activeId) {
        await this.loadConversation(activeId);
        conversationLifecycle.setActiveConversation(activeId);
        logger.info('Active conversation restored', { id: activeId });
      }

      // Si aucune conversation n'existe, en créer une
      if (this.index.length === 0) {
        logger.info('No conversations found, creating default');
        const conversation = conversationLifecycle.createConversation({
          title: 'Conversation de démarrage',
        });
        await this.saveConversation(conversation);
        conversationLifecycle.setActiveConversation(conversation.id);
      }

      this.initialized = true;
      logger.info('ConversationStorage initialized');
    } catch (error) {
      logger.error('Initialization error', error);
      // Créer une conversation par défaut en cas d'erreur
      const conversation = conversationLifecycle.createConversation({
        title: 'Conversation de récupération',
      });
      await this.saveConversation(conversation);
      conversationLifecycle.setActiveConversation(conversation.id);
      this.initialized = true;
    }
  }

  /**
   * Sauvegarder une conversation
   */
  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      // Mettre à jour timestamp
      conversation.updated_at = Date.now();

      // Sauvegarder en localStorage
      const key = STORAGE_KEY_PREFIX + conversation.id;
      localStorage.setItem(key, JSON.stringify(conversation));

      // Mettre à jour en mémoire
      this.conversations.set(conversation.id, conversation);

      // Mettre à jour l'index
      await this.updateIndex(conversation);

      logger.debug('Conversation saved', { id: conversation.id });
    } catch (error) {
      logger.error('Save conversation error', error);
      throw new Error('Failed to save conversation');
    }
  }

  /**
   * Charger une conversation
   */
  async loadConversation(conversationId: string): Promise<Conversation | null> {
    try {
      // Vérifier cache mémoire
      if (this.conversations.has(conversationId)) {
        return this.conversations.get(conversationId)!;
      }

      // Charger depuis localStorage
      const key = STORAGE_KEY_PREFIX + conversationId;
      const data = localStorage.getItem(key);

      if (!data) {
        logger.warn('Conversation not found', { id: conversationId });
        return null;
      }

      const conversation: Conversation = JSON.parse(data);
      this.conversations.set(conversationId, conversation);

      logger.debug('Conversation loaded', { id: conversationId });
      return conversation;
    } catch (error) {
      logger.error('Load conversation error', error);
      return null;
    }
  }

  /**
   * Lister toutes les conversations
   */
  async listConversations(): Promise<ConversationSummary[]> {
    console.log('[CONV_STORAGE]', { storageLen: this.index.length });
    return [...this.index].sort((a, b) => b.updated_at - a.updated_at);
  }

  /**
   * Obtenir la conversation active
   */
  async getActiveConversation(): Promise<Conversation | null> {
    const activeId = conversationLifecycle.getActiveConversation();
    if (!activeId) {
      return null;
    }
    return this.loadConversation(activeId);
  }

  /**
   * Ajouter un message à une conversation
   */
  async appendMessage(conversationId: string, message: AIMessage): Promise<void> {
    const conversation = await this.loadConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.messages.push(message);

    // Mettre à jour le titre si c'est le premier message utilisateur
    if (conversation.messages.filter(m => m.role === 'user').length === 1) {
      conversation.title = conversationLifecycle.updateConversationTitle(conversation);
    }

    await this.saveConversation(conversation);
  }

  /**
   * Archiver une conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    const conversation = await this.loadConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.status = 'archived';
    await this.saveConversation(conversation);
  }

  /**
   * Restaurer une conversation archivée
   */
  async restoreConversation(conversationId: string): Promise<void> {
    const conversation = await this.loadConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.status = 'active';
    await this.saveConversation(conversation);
  }

  /**
   * Supprimer une conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Supprimer de localStorage
      const key = STORAGE_KEY_PREFIX + conversationId;
      localStorage.removeItem(key);

      // Supprimer du cache
      this.conversations.delete(conversationId);

      // Mettre à jour l'index
      this.index = this.index.filter(item => item.id !== conversationId);
      await this.saveIndex();

      logger.info('Conversation deleted', { id: conversationId });
    } catch (error) {
      logger.error('Delete conversation error', error);
      throw new Error('Failed to delete conversation');
    }
  }

  /**
   * Mettre à jour l'index des conversations
   */
  private async updateIndex(conversation: Conversation): Promise<void> {
    const existingIndex = this.index.findIndex(item => item.id === conversation.id);
    const summary = conversationLifecycle.createSummary(conversation);

    if (existingIndex >= 0) {
      this.index[existingIndex] = summary;
    } else {
      this.index.push(summary);
    }

    await this.saveIndex();
  }

  /**
   * Sauvegarder l'index
   */
  private async saveIndex(): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(this.index));
    } catch (error) {
      logger.error('Save index error', error);
    }
  }

  /**
   * Gérer les événements du lifecycle
   */
  private handleLifecycleEvent(event: ConversationLifecycleEvent): void {
    // Log append-only des événements
    this.appendEvent(event);

    // Traiter selon le type
    switch (event.type) {
      case 'conversation.created': {
        // L'événement sera sauvegardé explicitement par le créateur
        break;
      }

      case 'conversation.activated': {
        localStorage.setItem(STORAGE_KEY_ACTIVE, event.conversation_id);
        break;
      }

      case 'conversation.message.appended': {
        if (event.data?.message) {
          void this.appendMessage(
            event.conversation_id,
            event.data.message as AIMessage
          ).catch(error => {
            logger.error('Failed to append message', error);
          });
        }
        break;
      }

      case 'conversation.archived': {
        void this.archiveConversation(event.conversation_id).catch(error => {
          logger.error('Failed to archive conversation', error);
        });
        break;
      }

      case 'conversation.restored': {
        void this.restoreConversation(event.conversation_id).catch(error => {
          logger.error('Failed to restore conversation', error);
        });
        break;
      }
    }
  }

  /**
   * Ajouter un événement au log append-only
   */
  private appendEvent(event: ConversationLifecycleEvent): void {
    try {
      const events = this.loadEvents();
      events.push(event);

      // Garder seulement les 1000 derniers événements
      const trimmed = events.slice(-1000);

      localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      logger.error('Append event error', error);
    }
  }

  /**
   * Charger les événements
   */
  private loadEvents(): ConversationLifecycleEvent[] {
    try {
      const data = localStorage.getItem(EVENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Exporter toutes les conversations (debug/backup)
   */
  async exportAll(): Promise<{
    conversations: Conversation[];
    events: ConversationLifecycleEvent[];
  }> {
    const conversations: Conversation[] = [];

    for (const summary of this.index) {
      const conv = await this.loadConversation(summary.id);
      if (conv) {
        conversations.push(conv);
      }
    }

    return {
      conversations,
      events: this.loadEvents(),
    };
  }

  /**
   * PHASE 3: Obtenir l'ID de la conversation active (SYNCHRONE)
   * Utilisé par useChat pour initialisation au mount
   */
  getActiveConversationId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEY_ACTIVE);
      return id || null;
    } catch (error) {
      logger.error('getActiveConversationId error', error);
      return null;
    }
  }

  /**
   * PHASE 3: Charger une conversation de façon SYNCHRONE
   * Utilisé par useChat pour charger messages au mount (éviter flash)
   * Note: Retourne null si conversation n'existe pas
   */
  loadConversationSync(conversationId: string): Conversation | null {
    try {
      // Vérifier cache mémoire d'abord
      if (this.conversations.has(conversationId)) {
        return this.conversations.get(conversationId) || null;
      }

      // Charger depuis localStorage
      const key = STORAGE_KEY_PREFIX + conversationId;
      const data = localStorage.getItem(key);
      if (!data) {
        logger.debug('Conversation not found (sync)', { id: conversationId });
        return null;
      }

      try {
        const conversation: Conversation = JSON.parse(data);
        // Mettre en cache
        this.conversations.set(conversationId, conversation);
        logger.debug('Conversation loaded (sync)', { id: conversationId });
        return conversation;
      } catch (parseError) {
        logger.error('Failed to parse conversation (sync)', parseError);
        return null;
      }
    } catch (error) {
      logger.error('loadConversationSync error', error);
      return null;
    }
  }

  /**
   * Reset (pour tests uniquement)
   */
  async reset(): Promise<void> {
    // Supprimer toutes les conversations
    for (const summary of this.index) {
      const key = STORAGE_KEY_PREFIX + summary.id;
      localStorage.removeItem(key);
    }

    // Supprimer les métadonnées
    localStorage.removeItem(STORAGE_KEY_INDEX);
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    localStorage.removeItem(EVENTS_KEY);

    // Reset état mémoire
    this.conversations.clear();
    this.index = [];
    this.initialized = false;

    logger.info('Storage reset');
  }
}

// Singleton instance
export const conversationStorage = new ConversationStorageService();
