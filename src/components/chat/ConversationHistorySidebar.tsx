/**
 * TITANE∞ v35.1.9 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ConversationHistorySidebar — ChatGPT/Claude style sidebar
 * Features: conversation list, rename inline, archive, delete, context menu
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useConversations } from '@/hooks/useConversations';
import type { ConversationSummary } from '@/types/conversation';
import './ConversationHistorySidebar.css';

type TitaneTabId =
  | 'conversation'
  | 'vision'
  | 'overview'
  | 'memory-map'
  | 'progression'
  | 'transformation';

export interface ConversationHistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: TitaneTabId;
  onTabChange: (tab: TitaneTabId) => void;
  onNewConversation: () => void;
  onConversationSelect?: (conversationId: string) => void;
  currentConversationId?: string | null;
}

// ═══ DATE GROUPING ═══

function groupConversationsByDate(conversations: ConversationSummary[]): {
  label: string;
  items: ConversationSummary[];
}[] {
  const now = Date.now();
  const oneDay = 86_400_000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const today: ConversationSummary[] = [];
  const thisWeek: ConversationSummary[] = [];
  const thisMonth: ConversationSummary[] = [];
  const older: ConversationSummary[] = [];

  for (const conv of conversations) {
    const age = now - conv.updated_at;
    if (age < oneDay) today.push(conv);
    else if (age < oneWeek) thisWeek.push(conv);
    else if (age < oneMonth) thisMonth.push(conv);
    else older.push(conv);
  }

  return [
    { label: "Aujourd'hui", items: today },
    { label: 'Cette semaine', items: thisWeek },
    { label: 'Ce mois', items: thisMonth },
    { label: 'Plus ancien', items: older },
  ].filter(g => g.items.length > 0);
}

function formatConvTitle(conv: ConversationSummary): string {
  if (
    conv.title &&
    conv.title.trim() &&
    conv.title !== 'Untitled' &&
    conv.title !== 'Nouvelle conversation'
  ) {
    const t = conv.title.trim();
    return t.length > 38 ? t.slice(0, 38) + '…' : t;
  }
  const d = new Date(conv.updated_at);
  return `Conv. ${d.toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `${days}j`;
  return new Date(timestamp).toLocaleDateString('fr-CA', {
    month: 'short',
    day: 'numeric',
  });
}

// ═══ NAV ITEMS ═══

const NAV_ITEMS: { id: TitaneTabId; icon: string; label: string }[] = [
  { id: 'overview', icon: '📊', label: 'Dashboard' },
  { id: 'vision', icon: '📷', label: 'Vision' },
  { id: 'memory-map', icon: '💾', label: 'Mémoire' },
  { id: 'progression', icon: '⚡', label: 'Progression' },
  { id: 'transformation', icon: '🌱', label: 'Évolution' },
];

// ═══ MAIN COMPONENT ═══

export const ConversationHistorySidebar: React.FC<ConversationHistorySidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  onNewConversation,
  onConversationSelect,
  currentConversationId,
}) => {
  const {
    conversations,
    isLoading,
    setActiveConversation,
    activeConversationId,
    renameConversation,
    archiveConversation,
    deleteConversation,
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Context menu state
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (!contextMenuRef.current?.contains(e.target as Node)) {
        setContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenuId]);

  // Auto-focus the rename input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleNewConversation = useCallback(() => {
    setSearchQuery('');
    setContextMenuId(null);
    onNewConversation();
  }, [onNewConversation]);

  const handleSelectConversation = useCallback(
    async (convId: string) => {
      if (editingId) return; // Don't switch during rename
      setContextMenuId(null);
      try {
        await setActiveConversation(convId);
      } catch {
        // non-fatal
      }
      onConversationSelect?.(convId);
    },
    [setActiveConversation, onConversationSelect, editingId]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setContextMenuId(prev => (prev === convId ? null : convId));
  }, []);

  const handleStartRename = useCallback((conv: ConversationSummary) => {
    setContextMenuId(null);
    setEditingId(conv.id);
    const rawTitle =
      conv.title && conv.title !== 'Untitled' && conv.title !== 'Nouvelle conversation'
        ? conv.title
        : '';
    setEditDraft(rawTitle);
  }, []);

  const handleCommitRename = useCallback(
    async (convId: string) => {
      const trimmed = editDraft.trim();
      if (trimmed) {
        try {
          await renameConversation(convId, trimmed);
        } catch {
          // non-fatal
        }
      }
      setEditingId(null);
      setEditDraft('');
    },
    [editDraft, renameConversation]
  );

  const handleCancelRename = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent, convId: string) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleCommitRename(convId);
      } else if (e.key === 'Escape') {
        handleCancelRename();
      }
    },
    [handleCommitRename, handleCancelRename]
  );

  const handleArchive = useCallback(
    async (convId: string) => {
      setContextMenuId(null);
      try {
        await archiveConversation(convId);
      } catch {
        // non-fatal
      }
    },
    [archiveConversation]
  );

  const handleDelete = useCallback(
    async (convId: string, title: string) => {
      setContextMenuId(null);
      const label = title.length > 40 ? title.slice(0, 40) + '…' : title;
      if (!window.confirm(`Supprimer "${label}" ? Cette action est irréversible.`))
        return;
      try {
        await deleteConversation(convId);
      } catch {
        // non-fatal
      }
    },
    [deleteConversation]
  );

  // Filter to active conversations only, sorted by most recent
  const activeConversations = conversations
    .filter(c => c.status === 'active')
    .sort((a, b) => b.updated_at - a.updated_at);

  const filtered = searchQuery.trim()
    ? activeConversations.filter(
        c =>
          (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatConvTitle(c).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeConversations;

  const groups = groupConversationsByDate(filtered);

  const resolvedActiveId = activeConversationId ?? currentConversationId ?? null;

  return (
    <aside
      className={`titane-chat-sidebar${isOpen ? ' titane-chat-sidebar--open' : ' titane-chat-sidebar--collapsed'}`}
      aria-label="Historique des conversations"
      data-testid="conversation-history-sidebar"
    >
      {/* ── HEADER ── */}
      <div className="titane-chat-sidebar-header">
        <div className="titane-chat-sidebar-brand">
          <span className="titane-chat-sidebar-brand-icon">⚡</span>
          {isOpen && <span className="titane-chat-sidebar-brand-name">TITANE∞</span>}
        </div>
        <button
          className="titane-chat-sidebar-toggle"
          onClick={onToggle}
          title={isOpen ? 'Réduire' : 'Ouvrir'}
          aria-label={isOpen ? 'Réduire la barre latérale' : 'Ouvrir la barre latérale'}
          aria-expanded={isOpen}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* ── NEW CONVERSATION ── */}
      <div className="titane-chat-sidebar-actions">
        <button
          className="titane-chat-sidebar-new-btn"
          onClick={handleNewConversation}
          title="Nouvelle conversation (Ctrl+N)"
          aria-label="Démarrer une nouvelle conversation"
          data-testid="btn-new-conversation"
        >
          <span className="titane-chat-sidebar-new-icon">✏️</span>
          {isOpen && (
            <span className="titane-chat-sidebar-new-label">Nouvelle conversation</span>
          )}
        </button>
      </div>

      {/* ── SEARCH ── */}
      {isOpen && (
        <div className="titane-chat-sidebar-search">
          <div className="titane-chat-sidebar-search-wrap">
            <span className="titane-chat-sidebar-search-icon">🔍</span>
            <input
              ref={searchRef}
              type="text"
              className="titane-chat-sidebar-search-input"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Rechercher dans les conversations"
            />
            {searchQuery && (
              <button
                className="titane-chat-sidebar-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CONVERSATION LIST ── */}
      <div className="titane-chat-sidebar-list" role="list" aria-label="Conversations">
        {isLoading && (
          <div className="titane-chat-sidebar-loading">
            <span className="titane-chat-sidebar-loading-dot" />
          </div>
        )}

        {!isLoading && groups.length === 0 && isOpen && (
          <div className="titane-chat-sidebar-empty">
            {searchQuery
              ? 'Aucun résultat'
              : 'Aucune conversation\nEnvoyez un message pour commencer'}
          </div>
        )}

        {!isLoading && groups.length === 0 && !isOpen && (
          <div className="titane-chat-sidebar-loading">
            <span className="titane-chat-sidebar-loading-dot" style={{ opacity: 0.3 }} />
          </div>
        )}

        {groups.map(group => (
          <div key={group.label} className="titane-chat-sidebar-group" role="group">
            {isOpen && (
              <div className="titane-chat-sidebar-group-label">{group.label}</div>
            )}
            {group.items.map(conv => {
              const isActive = conv.id === resolvedActiveId;
              const isEditing = editingId === conv.id;
              const showContextMenu = contextMenuId === conv.id;
              const displayTitle = formatConvTitle(conv);

              return (
                <div
                  key={conv.id}
                  className={`titane-chat-sidebar-item-wrapper${isActive ? ' titane-chat-sidebar-item-wrapper--active' : ''}`}
                  role="listitem"
                >
                  {isEditing && isOpen ? (
                    /* ── INLINE RENAME INPUT ── */
                    <div className="titane-chat-sidebar-item titane-chat-sidebar-item--editing">
                      <span className="titane-chat-sidebar-item-icon">✏️</span>
                      <input
                        ref={editInputRef}
                        type="text"
                        className="titane-chat-sidebar-rename-input"
                        value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        onBlur={() => void handleCommitRename(conv.id)}
                        onKeyDown={e => handleRenameKeyDown(e, conv.id)}
                        placeholder={displayTitle}
                        aria-label="Nouveau titre"
                        maxLength={80}
                        data-testid={`rename-input-${conv.id}`}
                      />
                    </div>
                  ) : (
                    /* ── CONVERSATION ITEM ── */
                    <button
                      className={`titane-chat-sidebar-item${isActive ? ' titane-chat-sidebar-item--active' : ''}`}
                      onClick={() => void handleSelectConversation(conv.id)}
                      title={`${displayTitle} · ${conv.message_count} msg`}
                      aria-label={`Conversation: ${displayTitle}`}
                      aria-current={isActive ? 'true' : undefined}
                      data-testid={`conversation-item-${conv.id}`}
                    >
                      <span className="titane-chat-sidebar-item-icon">💬</span>
                      {isOpen ? (
                        <>
                          <span className="titane-chat-sidebar-item-label">
                            {displayTitle}
                          </span>
                          <span className="titane-chat-sidebar-item-footer">
                            <span className="titane-chat-sidebar-item-meta">
                              {formatRelativeTime(conv.updated_at)}
                            </span>
                            {conv.message_count > 0 && (
                              <span className="titane-chat-sidebar-item-count">
                                {conv.message_count}
                              </span>
                            )}
                          </span>
                        </>
                      ) : null}
                    </button>
                  )}

                  {/* ── CONTEXT MENU TRIGGER ── */}
                  {isOpen && !isEditing && (
                    <div
                      className="titane-chat-sidebar-item-menu"
                      ref={showContextMenu ? contextMenuRef : undefined}
                    >
                      <button
                        className="titane-chat-sidebar-item-menu-btn"
                        onClick={e => handleContextMenu(e, conv.id)}
                        title="Options"
                        aria-label="Options de la conversation"
                        aria-expanded={showContextMenu}
                        data-testid={`conv-menu-btn-${conv.id}`}
                      >
                        ⋯
                      </button>

                      {showContextMenu && (
                        <div
                          className="titane-chat-context-menu"
                          role="menu"
                          data-testid={`conv-context-menu-${conv.id}`}
                        >
                          <button
                            className="titane-chat-context-menu-item"
                            role="menuitem"
                            onClick={() => handleStartRename(conv)}
                            data-testid={`conv-rename-${conv.id}`}
                          >
                            <span>✏️</span> Renommer
                          </button>
                          <button
                            className="titane-chat-context-menu-item"
                            role="menuitem"
                            onClick={() => void handleArchive(conv.id)}
                            data-testid={`conv-archive-${conv.id}`}
                          >
                            <span>📦</span> Archiver
                          </button>
                          <div className="titane-chat-context-menu-separator" />
                          <button
                            className="titane-chat-context-menu-item titane-chat-context-menu-item--danger"
                            role="menuitem"
                            onClick={() => void handleDelete(conv.id, displayTitle)}
                            data-testid={`conv-delete-${conv.id}`}
                          >
                            <span>🗑️</span> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="titane-chat-sidebar-nav"
        aria-label="Navigation TITANE"
        role="navigation"
      >
        <div className="titane-chat-sidebar-nav-divider" />
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`titane-chat-sidebar-nav-item${activeTab === item.id ? ' titane-chat-sidebar-nav-item--active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
            aria-label={`Aller à ${item.label}`}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="titane-chat-sidebar-nav-icon">{item.icon}</span>
            {isOpen && (
              <span className="titane-chat-sidebar-nav-label">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ConversationHistorySidebar;
