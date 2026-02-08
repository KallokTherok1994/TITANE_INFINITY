/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — CONVERSATIONS SIDEBAR
 *   Liste des conversations avec bouton "Nouvelle conversation"
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { useConversationsContext } from '@/contexts/ConversationsContext';
import type { ConversationSummary } from '@/types/conversation';
import { g4Log } from '@/lib/telemetry/convG4Collector';
import './ConversationsSidebar.css';

export interface ConversationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    conversations,
    storageCount,
    activeConversationId,
    isLoading,
    createConversation,
    setActiveConversation,
    archiveConversation,
    restoreConversation,
    deleteConversation,
  } = useConversationsContext();

  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [desync, setDesync] = useState(false);

  const handleNewConversation = async () => {
    const conversation = await createConversation({ title: 'Nouvelle conversation' });
    await setActiveConversation(conversation.id);
    onClose(); // Fermer la sidebar après création
  };

  const handleSelectConversation = async (conversation: ConversationSummary) => {
    if (conversation.status === 'archived') {
      await restoreConversation(conversation.id);
    }
    await setActiveConversation(conversation.id);
    onClose(); // Fermer la sidebar après sélection
  };

  const handleConversationKeyDown = async (
    event: React.KeyboardEvent<HTMLDivElement>,
    conversation: ConversationSummary
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      await handleSelectConversation(conversation);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Archiver cette conversation ?')) {
      await archiveConversation(id);
      setContextMenuId(null);
    }
  };

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Restaurer cette conversation ?')) {
      await restoreConversation(id);
      setContextMenuId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Supprimer définitivement cette conversation ?')) {
      await deleteConversation(id);
      setContextMenuId(null);
    }
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp || Number.isNaN(timestamp)) return 'Date inconnue';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;

    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    console.log('[CONV_UI] MOUNT');
    void g4Log('CONV_UI', { phase: 'MOUNT', len: conversations.length, storageCount });
    return () => {
      console.log('[CONV_UI] UNMOUNT');
      void g4Log('CONV_UI', { phase: 'UNMOUNT', len: conversations.length, storageCount });
    };
  }, [conversations.length, isOpen, storageCount]);

  useEffect(() => {
    if (!isOpen) return;
    console.log('[CONV_UI] RENDER', {
      len: conversations.length,
      storageCount,
      activeId: activeConversationId,
    });
    void g4Log('CONV_UI', {
      phase: 'RENDER',
      len: conversations.length,
      storageCount,
      activeId: activeConversationId,
    });
  }, [activeConversationId, conversations.length, isOpen, storageCount]);

  useEffect(() => {
    if (!isOpen) return;
    console.log('[CONV_UI] RAW', conversations);
    void g4Log('CONV_UI', {
      phase: 'RAW',
      len: conversations.length,
      storageCount,
      sampleId: conversations[0]?.id,
    });
  }, [conversations, isOpen, storageCount]);

  useEffect(() => {
    if (!isOpen) return;
    if (storageCount > 0 && conversations.length === 0 && !isLoading) {
      const timer = setTimeout(() => {
        setDesync(true);
        console.error('[CONV_DESYNC]', { storageCount, uiLen: conversations.length });
        void g4Log('CONV_DESYNC', { storageCount, uiLen: conversations.length });
      }, 250);
      return () => clearTimeout(timer);
    }
    setDesync(false);
  }, [conversations.length, isLoading, isOpen, storageCount]);

  if (!isOpen) return null;

  return (
    <div className="conversations-sidebar-overlay" onClick={onClose}>
      <div
        className="conversations-sidebar"
        onClick={e => e.stopPropagation()}
        data-testid="conversations-sidebar"
      >
        {/* Header */}
        <div className="conversations-sidebar__header">
          <h2>Conversations</h2>
          <button
            className="conversations-sidebar__close"
            onClick={onClose}
            aria-label="Fermer"
            data-testid="conversations-close"
          >
            ✕
          </button>
        </div>

        {/* Bouton Nouvelle Conversation */}
        <button
          className="conversations-sidebar__new-btn"
          onClick={handleNewConversation}
          disabled={isLoading}
          data-testid="conversations-new"
        >
          <span className="icon">+</span>
          <span>Nouvelle conversation</span>
        </button>

        {/* Liste des conversations */}
        <div className="conversations-sidebar__list">
          {desync && (
            <div className="conversations-sidebar__empty">
              Diagnostic: storage &gt; 0 mais UI vide.
            </div>
          )}
          {isLoading && conversations.length === 0 ? (
            <div className="conversations-sidebar__loading">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="conversations-sidebar__empty">
              Aucune conversation. Créez-en une !
            </div>
          ) : (
            conversations.map((conv: ConversationSummary) => (
              <div
                key={conv.id}
                className={`conversation-item ${
                  conv.id === activeConversationId ? 'conversation-item--active' : ''
                } ${conv.status === 'archived' ? 'conversation-item--archived' : ''}`}
                role="button"
                tabIndex={0}
                aria-current={conv.id === activeConversationId ? 'true' : undefined}
                onClick={() => handleSelectConversation(conv)}
                onKeyDown={event => handleConversationKeyDown(event, conv)}
                onContextMenu={e => {
                  e.preventDefault();
                  setContextMenuId(contextMenuId === conv.id ? null : conv.id);
                }}
                data-testid="conversation-item"
                data-conversation-id={conv.id}
              >
                <div className="conversation-item__content">
                  <div className="conversation-item__title">{conv.title}</div>
                  <div className="conversation-item__meta">
                    <span className="conversation-item__date">
                      {formatDate(conv.updated_at)}
                    </span>
                    {conv.message_count > 0 && (
                      <span className="conversation-item__count">
                        {conv.message_count} msg
                      </span>
                    )}
                  </div>
                </div>

                {/* Context Menu */}
                {contextMenuId === conv.id && (
                  <div className="conversation-item__menu">
                    {conv.status === 'archived' ? (
                      <button
                        className="conversation-item__menu-btn"
                        onClick={e => handleRestore(e, conv.id)}
                      >
                        ♻️ Restaurer
                      </button>
                    ) : (
                      <button
                        className="conversation-item__menu-btn"
                        onClick={e => handleArchive(e, conv.id)}
                      >
                        📦 Archiver
                      </button>
                    )}
                    <button
                      className="conversation-item__menu-btn conversation-item__menu-btn--danger"
                      onClick={e => handleDelete(e, conv.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="conversations-sidebar__footer">
          <span className="conversations-sidebar__stats">
            {conversations.filter(c => c.status === 'active').length} active
            {conversations.filter(c => c.status === 'archived').length > 0 &&
              ` • ${conversations.filter(c => c.status === 'archived').length} archivée(s)`}
          </span>
        </div>
      </div>
    </div>
  );
};
