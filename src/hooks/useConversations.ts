/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — USE CONVERSATIONS HOOK
 *   Hook React pour gestion des conversations multiples
 *   Ring 4 (UI) → Ring 3 (Services) → Ring 2 (Engines) → Ring 1 (Types)
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Conversation,
  ConversationSummary,
  CreateConversationOptions,
} from '@/types/conversation';
import { conversationLifecycle } from '@/engines/conversation/conversationLifecycleEngine';
import { conversationStorage } from '@/services/conversation/conversationStorage';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useConversations');

export interface UseConversationsReturn {
  // État
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  isLoading: boolean;

  // Actions
  createConversation: (options?: CreateConversationOptions) => Promise<Conversation>;
  setActiveConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  restoreConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

/**
 * Hook de gestion des conversations multiples
 *
 * Usage:
 * ```tsx
 * const { conversations, activeConversationId, createConversation, setActiveConversation } = useConversations();
 * ```
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(
    null
  );
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialisation au mount
  useEffect(() => {
    if (initialized) return;

    let cancelled = false;

    const init = async () => {
      try {
        setIsLoading(true);
        await conversationStorage.initialize();

        if (cancelled) return;

        // Charger l'état initial
        const list = await conversationStorage.listConversations();
        const active = await conversationStorage.getActiveConversation();

        if (!cancelled) {
          setConversations(list);
          setActiveConversation(active);
          setActiveConversationIdState(active?.id || null);
          setInitialized(true);
          logger.info('Conversations initialized', {
            count: list.length,
            activeId: active?.id,
          });
        }
      } catch (error) {
        logger.error('Initialization error', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [initialized]);

  /**
   * Créer une nouvelle conversation
   */
  const createConversation = useCallback(
    async (options?: CreateConversationOptions): Promise<Conversation> => {
      const conversation = conversationLifecycle.createConversation(options);
      await conversationStorage.saveConversation(conversation);

      // Mettre à jour l'état
      const updatedList = await conversationStorage.listConversations();
      setConversations(updatedList);

      logger.info('Conversation created', { id: conversation.id });
      return conversation;
    },
    []
  );

  /**
   * Définir la conversation active
   */
  const setActiveConversationAction = useCallback(
    async (conversationId: string): Promise<void> => {
      conversationLifecycle.setActiveConversation(conversationId);

      const conversation = await conversationStorage.loadConversation(conversationId);
      if (conversation) {
        setActiveConversation(conversation);
        setActiveConversationIdState(conversationId);
        logger.info('Active conversation changed', { id: conversationId });
      }
    },
    []
  );

  /**
   * Archiver une conversation
   */
  const archiveConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      conversationLifecycle.archiveConversation(conversationId);
      await conversationStorage.archiveConversation(conversationId);

      // Mettre à jour la liste
      const updatedList = await conversationStorage.listConversations();
      setConversations(updatedList);

      // Si c'était la conversation active, créer une nouvelle
      if (conversationId === activeConversationId) {
        const newConversation = await createConversation({
          title: 'Nouvelle conversation',
        });
        await setActiveConversationAction(newConversation.id);
      }

      logger.info('Conversation archived', { id: conversationId });
    },
    [activeConversationId, createConversation, setActiveConversationAction]
  );

  /**
   * Restaurer une conversation archivée
   */
  const restoreConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      conversationLifecycle.restoreConversation(conversationId);
      await conversationStorage.restoreConversation(conversationId);

      const updatedList = await conversationStorage.listConversations();
      setConversations(updatedList);

      logger.info('Conversation restored', { id: conversationId });
    },
    []
  );

  /**
   * Supprimer une conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      await conversationStorage.deleteConversation(conversationId);

      // Mettre à jour la liste
      const updatedList = await conversationStorage.listConversations();
      setConversations(updatedList);

      // Si c'était la conversation active, créer une nouvelle
      if (conversationId === activeConversationId) {
        const newConversation = await createConversation({
          title: 'Nouvelle conversation',
        });
        await setActiveConversationAction(newConversation.id);
      }

      logger.info('Conversation deleted', { id: conversationId });
    },
    [activeConversationId, createConversation, setActiveConversationAction]
  );

  /**
   * Rafraîchir la liste des conversations
   */
  const refreshConversations = useCallback(async (): Promise<void> => {
    const list = await conversationStorage.listConversations();
    const active = await conversationStorage.getActiveConversation();

    setConversations(list);
    setActiveConversation(active);
    setActiveConversationIdState(active?.id || null);

    logger.debug('Conversations refreshed', { count: list.length });
  }, []);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    isLoading,
    createConversation,
    setActiveConversation: setActiveConversationAction,
    archiveConversation,
    restoreConversation,
    deleteConversation,
    refreshConversations,
  };
}
