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

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type {
  Conversation,
  ConversationSummary,
  CreateConversationOptions,
} from '@/types/conversation';
import { conversationLifecycle } from '@/engines/conversation/conversationLifecycleEngine';
import { conversationStorage } from '@/services/conversation/conversationStorage';
import { createLogger } from '@/utils/logger';
import { g4Log } from '@/lib/telemetry/convG4Collector';

const logger = createLogger('useConversations');

export interface UseConversationsReturn {
  // État
  conversations: ConversationSummary[];
  storageCount: number;
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
  const [storageCount, setStorageCount] = useState(0);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(
    null
  );
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const instanceIdRef = useRef(`conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const mountedRef = useRef(true);

  const safeSetState = useCallback(
    <T>(
      setter: Dispatch<SetStateAction<T>>,
      value: SetStateAction<T>,
      reason: string
    ) => {
      if (!mountedRef.current) {
        console.warn('[CONV_SKIP_SETSTATE]', {
          instanceId: instanceIdRef.current,
          reason,
        });
        void g4Log('CONV_SKIP_SETSTATE', {
          instanceId: instanceIdRef.current,
          reason,
        });
        return;
      }
      setter(value);
    },
    []
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialisation au mount
  useEffect(() => {
    if (initialized) return;

    let cancelled = false;

    const init = async () => {
      try {
        safeSetState(setIsLoading, true, 'init:start');
        console.log('[CONV_HOOK] INIT_START', { instanceId: instanceIdRef.current });
        void g4Log('CONV_HOOK', {
          phase: 'INIT_START',
          instanceId: instanceIdRef.current,
        });
        await conversationStorage.initialize();

        if (cancelled) return;

        // Charger l'état initial
        const list = await conversationStorage.listConversations();
        const active = await conversationStorage.getActiveConversation();

        if (!cancelled) {
          safeSetState(setConversations, list, 'init:list');
          safeSetState(setActiveConversation, active, 'init:active');
          safeSetState(setActiveConversationIdState, active?.id || null, 'init:activeId');
          safeSetState(setStorageCount, list.length, 'init:storageCount');
          safeSetState(setInitialized, true, 'init:initialized');
          console.log('[CONV_HOOK] INIT_DONE', {
            instanceId: instanceIdRef.current,
            listLen: list.length,
            activeId: active?.id,
          });
          void g4Log('CONV_HOOK', {
            phase: 'INIT_DONE',
            instanceId: instanceIdRef.current,
            listLen: list.length,
            storageCount: list.length,
            activeId: active?.id || null,
          });
          logger.info('Conversations initialized', {
            count: list.length,
            activeId: active?.id,
          });
        }
      } catch (error) {
        logger.error('Initialization error', error);
      } finally {
        if (!cancelled) {
          safeSetState(setIsLoading, false, 'init:done');
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
      safeSetState(setConversations, updatedList, 'create:list');
      safeSetState(setStorageCount, updatedList.length, 'create:storageCount');

      console.log('[CONV_HOOK] CREATED', {
        instanceId: instanceIdRef.current,
        id: conversation.id,
        listLen: updatedList.length,
      });
      void g4Log('CONV_HOOK', {
        phase: 'CREATED',
        instanceId: instanceIdRef.current,
        id: conversation.id,
        listLen: updatedList.length,
        storageCount: updatedList.length,
      });

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
        safeSetState(setActiveConversation, conversation, 'setActive:conversation');
        safeSetState(setActiveConversationIdState, conversationId, 'setActive:id');
        console.log('[CONV_HOOK] ACTIVE_SET', {
          instanceId: instanceIdRef.current,
          id: conversationId,
        });
        void g4Log('CONV_HOOK', {
          phase: 'ACTIVE_SET',
          instanceId: instanceIdRef.current,
          id: conversationId,
        });
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
      safeSetState(setConversations, updatedList, 'archive:list');
      safeSetState(setStorageCount, updatedList.length, 'archive:storageCount');

      // Si c'était la conversation active, créer une nouvelle
      if (conversationId === activeConversationId) {
        const newConversation = await createConversation({
          title: 'Nouvelle conversation',
        });
        await setActiveConversationAction(newConversation.id);
      }

      console.log('[CONV_HOOK] ARCHIVED', {
        instanceId: instanceIdRef.current,
        id: conversationId,
        listLen: updatedList.length,
      });
      void g4Log('CONV_HOOK', {
        phase: 'ARCHIVED',
        instanceId: instanceIdRef.current,
        id: conversationId,
        listLen: updatedList.length,
        storageCount: updatedList.length,
      });
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
      safeSetState(setConversations, updatedList, 'restore:list');
      safeSetState(setStorageCount, updatedList.length, 'restore:storageCount');

      console.log('[CONV_HOOK] RESTORED', {
        instanceId: instanceIdRef.current,
        id: conversationId,
        listLen: updatedList.length,
      });
      void g4Log('CONV_HOOK', {
        phase: 'RESTORED',
        instanceId: instanceIdRef.current,
        id: conversationId,
        listLen: updatedList.length,
        storageCount: updatedList.length,
      });
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
      safeSetState(setConversations, updatedList, 'delete:list');
      safeSetState(setStorageCount, updatedList.length, 'delete:storageCount');

      // Si c'était la conversation active, créer une nouvelle
      if (conversationId === activeConversationId) {
        const newConversation = await createConversation({
          title: 'Nouvelle conversation',
        });
        await setActiveConversationAction(newConversation.id);
      }

      console.log('[CONV_HOOK] DELETED', {
        instanceId: instanceIdRef.current,
        id: conversationId,
        listLen: updatedList.length,
      });
      void g4Log('CONV_HOOK', {
        phase: 'DELETED',
        instanceId: instanceIdRef.current,
        id: conversationId,
        listLen: updatedList.length,
        storageCount: updatedList.length,
      });
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

    safeSetState(setConversations, list, 'refresh:list');
    safeSetState(setActiveConversation, active, 'refresh:active');
    safeSetState(setActiveConversationIdState, active?.id || null, 'refresh:activeId');
    safeSetState(setStorageCount, list.length, 'refresh:storageCount');

    console.log('[CONV_HOOK] REFRESH', {
      instanceId: instanceIdRef.current,
      listLen: list.length,
      activeId: active?.id,
    });
    void g4Log('CONV_HOOK', {
      phase: 'REFRESH',
      instanceId: instanceIdRef.current,
      listLen: list.length,
      storageCount: list.length,
      activeId: active?.id || null,
    });
    logger.debug('Conversations refreshed', { count: list.length });
  }, []);

  return {
    conversations,
    storageCount,
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
