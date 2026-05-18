/**
 * TITANE∞ v35.1.9 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ConversationHistorySidebar — ChatGPT/Claude style sidebar
 * Uses conversationStorage via useConversations hook for proper data access.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useConversations } from '@/hooks/useConversations';
import type { ConversationSummary } from '@/types/conversation';

type TitaneTabId = 'conversation' | 'vision' | 'overview' | 'memory-map' | 'progression' | 'transformation';

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
  if (conv.title && conv.title.trim() && conv.title !== 'Untitled' && conv.title !== 'Nouvelle conversation') {
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
  return new Date(timestamp).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });
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
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const handleNewConversation = useCallback(() => {
    setSearchQuery('');
    onNewConversation();
  }, [onNewConversation]);

  const handleSelectConversation = useCallback(async (convId: string) => {
    try {
      await setActiveConversation(convId);
    } catch {
      // non-fatal
    }
    // Notify parent to remount ConversationSection with the new conversation
    onConversationSelect?.(convId);
  }, [setActiveConversation, onConversationSelect]);

  // Filter to active conversations only, sorted by most recent
  const activeConversations = conversations
    .filter(c => c.status === 'active')
    .sort((a, b) => b.updated_at - a.updated_at);

  const filtered = searchQuery.trim()
    ? activeConversations.filter(c =>
        formatConvTitle(c).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeConversations;

  const groups = groupConversationsByDate(filtered);

  // Resolve active ID (from hook or prop)
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
          title="Nouvelle conversation"
          aria-label="Démarrer une nouvelle conversation"
          data-testid="btn-new-conversation"
        >
          <span className="titane-chat-sidebar-new-icon">✏️</span>
          {isOpen && <span className="titane-chat-sidebar-new-label">Nouvelle conversation</span>}
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
            {searchQuery ? 'Aucun résultat' : 'Aucune conversation\nEnvoyez un message pour commencer'}
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
              <div className="titane-chat-sidebar-group-label">
                {group.label}
              </div>
            )}
            {group.items.map(conv => {
              const isActive = conv.id === resolvedActiveId;
              return (
                <button
                  key={conv.id}
                  className={`titane-chat-sidebar-item${isActive ? ' titane-chat-sidebar-item--active' : ''}`}
                  role="listitem"
                  onClick={() => handleSelectConversation(conv.id)}
                  title={`${formatConvTitle(conv)} · ${conv.message_count} msg`}
                  aria-label={`Conversation: ${formatConvTitle(conv)}`}
                  aria-current={isActive ? 'true' : undefined}
                  data-testid={`conversation-item-${conv.id}`}
                >
                  <span className="titane-chat-sidebar-item-icon">💬</span>
                  {isOpen ? (
                    <>
                      <span className="titane-chat-sidebar-item-label">
                        {formatConvTitle(conv)}
                      </span>
                      <span className="titane-chat-sidebar-item-meta">
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                    </>
                  ) : null}
                </button>
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
            {isOpen && <span className="titane-chat-sidebar-nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ConversationHistorySidebar;
