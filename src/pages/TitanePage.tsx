/**
 * TITANE∞ v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v35.1.8 — TITANE — LE CŒUR DU SYSTÈME (REFACTORED - Phase 3C)
 *
 * FUSION ULTIME de 3 modules majeurs:
 * - Chat IA (/chat) → Communication & Intelligence Conversationnelle
 * - Vision (/camera) → Perception Visuelle & Affect Estimation
 * - EVO (/evo) → Évolution Totale (Dashboard, Memory, Progression)
 *
 * 6 SECTIONS UNIFIÉES (EXTRACTED AS INDEPENDENT COMPONENTS):
 * 💬 CONVERSATION - Interface Chat IA multi-provider
 * 📷 VISION & PERCEPTION - Analyse visuelle et affective
 * 📊 VUE D'ENSEMBLE - Dashboard système et stats
 * 💾 MÉMOIRE TRIPLE - Architecture court/moyen/long terme
 * ⚡ PROGRESSION & XP - Système XP, milestones, talents
 * 🌱 TRANSFORM & ÉVOLUTION - Transformation + Évolution mémoire fusionnées
 *
 * Phase 3C Refactoring:
 * - Extracted 8 internal section components to src/components/sections/
 * - TitanePage now acts as an orchestrator/router for tab switching
 * - Bundle size optimized (1700+ duplicate lines removed from main file)
 * - Improved maintainability and reusability
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Stack } from '@components/layout';
import { useVisualEngines } from '@hooks/useVisualEngines';
import { createProgressionStateFromExperience } from '@/cognitive/progression/xpEngine';
import type { ProgressionState } from '@/cognitive/types';
import { tauriClient } from '@/lib/tauriClient';
import type { MemoryStats } from '@/services/memory/persistentMemory.config';
import { normalizePersistentMemoryStats } from '@/services/memory/persistentMemory.normalize';
import { useExperience } from '@/hooks/useExperience';

// Section Components (Phase 3C Extracted)
import {
  ConversationSection,
  VisionSection,
  OverviewSection,
  MemorySection,
  ProgressionSection,
  TransformationSection,
} from '@/components/sections';
import type { TitaneStats } from '@/components/sections';

// UI Components
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TitaneLogo } from '@/components/branding/TitaneLogo';
import { moduleContextRegistry } from '@/services/modules/moduleContextRegistry';
import { ConversationHistorySidebar } from '@/components/chat/ConversationHistorySidebar';
import { useConversations } from '@/hooks/useConversations';

import './TitanePage.css';
import './TitanePage-local.css';
import { SurfaceTruthBadge } from '@/components/system/SurfaceTruthBadge';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

type TabId =
  | 'conversation'
  | 'vision'
  | 'overview'
  | 'memory-map'
  | 'progression'
  | 'transformation';

const VALID_TABS: TabId[] = [
  'conversation',
  'vision',
  'overview',
  'memory-map',
  'progression',
  'transformation',
];

const isTabId = (value: string | null): value is TabId => {
  return value !== null && VALID_TABS.includes(value as TabId);
};

const TAB_PANEL_IDS: Record<TabId, string> = {
  conversation: 'titane-panel-conversation',
  vision: 'titane-panel-vision',
  overview: 'titane-panel-overview',
  'memory-map': 'titane-panel-memory',
  progression: 'titane-panel-progression',
  transformation: 'titane-panel-transformation',
};

const TAB_LABEL_IDS: Record<TabId, string> = {
  conversation: 'titane-tab-conversation',
  vision: 'titane-tab-vision',
  overview: 'titane-tab-overview',
  'memory-map': 'titane-tab-memory',
  progression: 'titane-tab-progression',
  transformation: 'titane-tab-transformation',
};

const TAB_TEST_IDS: Record<TabId, string> = {
  conversation: 'tab-conversation',
  vision: 'tab-vision',
  overview: 'tab-overview',
  'memory-map': 'tab-memory',
  progression: 'tab-progression',
  transformation: 'tab-transformation',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TitanePage - Main orchestrator component for TITANE system
 *
 * Responsibilities:
 * - Tab state management
 * - Progression state loading
 * - Stats calculation
 * - Section routing/rendering
 * - Visual engines initialization
 *
 * All section implementations have been extracted to separate components
 * in src/components/sections/ for better maintainability and testability.
 */
export const TitanePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ═══ STATE ═══
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const requestedTab = searchParams.get('tab');
    return isTabId(requestedTab) ? requestedTab : 'conversation';
  });
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const { state: experienceState } = useExperience();

  // LOCK2: titane_active_conversation_id is canonical; legacy key migrated on boot.
  const [conversationId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('titane_active_conversation_id') ?? '';
  });

  // ═══ SIDEBAR STATE ═══
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('titane_chat_sidebar_open') !== 'false';
    } catch {
      return true;
    }
  });
  // Used to force remount of ConversationSection on new conversation
  const [chatKey, setChatKey] = useState<number>(0);

  // ═══ CONVERSATION TITLE BAR STATE ═══
  const { activeConversation, renameConversation } = useConversations();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleStartTitleEdit = useCallback(() => {
    const currentTitle = activeConversation?.title ?? '';
    const isGeneric =
      !currentTitle ||
      currentTitle === 'Untitled' ||
      currentTitle === 'Nouvelle conversation';
    setTitleDraft(isGeneric ? '' : currentTitle);
    setEditingTitle(true);
  }, [activeConversation]);

  const handleCommitTitleEdit = useCallback(async () => {
    const id = activeConversation?.id;
    if (id && titleDraft.trim()) {
      try {
        await renameConversation(id, titleDraft.trim());
      } catch {
        /* non-fatal */
      }
    }
    setEditingTitle(false);
    setTitleDraft('');
  }, [activeConversation, titleDraft, renameConversation]);

  const handleCancelTitleEdit = useCallback(() => {
    setEditingTitle(false);
    setTitleDraft('');
  }, []);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('titane_chat_sidebar_open', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const handleNewConversation = useCallback(() => {
    try {
      localStorage.removeItem('titane_active_conversation_id');
    } catch {
      /* ignore */
    }
    setChatKey(k => k + 1);
  }, []);

  const handleSelectConversation = useCallback((convId: string) => {
    try {
      localStorage.setItem('titane_active_conversation_id', convId);
    } catch {
      /* ignore */
    }
    setChatKey(k => k + 1);
  }, []);

  // ═══ VISUAL ENGINES INITIALIZATION ═══
  useVisualEngines({
    engines: { stable: true, helios: true, nexus: true },
    health: 100,
    mode: 'stable',
  });

  // ═══ PROGRESSION SNAPSHOT FROM CANONICAL EXPERIENCE STATE ═══
  const progression = useMemo<ProgressionState>(
    () => createProgressionStateFromExperience(experienceState),
    [experienceState]
  );

  // ═══ MEMORY STATS LOADING ═══
  useEffect(() => {
    const loadMemoryStats = async () => {
      try {
        const stats = normalizePersistentMemoryStats(
          await tauriClient.persistentMemoryGetStats()
        ) as MemoryStats;
        setMemoryStats(stats);
      } catch {
        // Non-blocking: hardcoded fallback values will be used
      }
    };
    loadMemoryStats();
  }, []);

  // ═══ STATS CALCULATION ═══
  const stats: TitaneStats = useMemo(
    () => ({
      totalXP: progression?.totalXP ?? 0,
      level: progression?.level ?? 1,
      chatMessageCount: progression?.chatMessageCount ?? 0,
      memoryShortTerm: memoryStats?.countByLevel?.['session'] ?? 0,
      memoryMidTerm: memoryStats?.countByLevel?.['intermediate'] ?? 0,
      memoryLongTerm: memoryStats?.countByLevel?.['long_term'] ?? 0,
      evolutionScore: progression?.totalXP
        ? Math.min(100, Math.round((progression.totalXP / 250000) * 100))
        : 0,
    }),
    [progression, memoryStats]
  );

  // ═══ MODULE CONTEXT REGISTRY ═══
  useEffect(() => {
    moduleContextRegistry.publish('titane.dashboard', {
      moduleId: 'titane.dashboard',
      route: '/titane',
      title: 'TITANE — Le Cœur du Système',
      status: memoryStats != null ? 'live' : 'partial',
      source: 'tauri_ipc',
      capabilities: ['chat', 'progression', 'memory', 'provider-routing'],
      visibleMetrics: {
        level: stats.level,
        totalXP: stats.totalXP,
        chatMessages: stats.chatMessageCount,
        memorySTM: stats.memoryShortTerm,
        memoryMTM: stats.memoryMidTerm,
        memoryLTM: stats.memoryLongTerm,
        evolutionScore: stats.evolutionScore,
        activeTab,
      },
      actions: [
        { id: 'send_message', label: 'Envoyer un message', status: 'wired' },
        { id: 'switch_tab', label: "Changer d'onglet", status: 'wired' },
        { id: 'refresh_memory', label: 'Rafraîchir mémoire', status: 'wired' },
      ],
      memoryRefs: ['titane_active_conversation_id', 'titane_chat_mode_*'],
      warnings:
        memoryStats == null
          ? ['Memory stats unavailable — tauri IPC may be degraded']
          : [],
    });
  }, [stats, memoryStats, activeTab]);

  const updateActiveTab = useCallback(
    (nextTab: TabId) => {
      setActiveTab(nextTab);
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          next.set('tab', nextTab);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    // Backward compat: ?tab=identity or ?tab=symbiose → fallback conversation (twins tab supprimé)
    if (requestedTab === 'identity' || requestedTab === 'symbiose') {
      updateActiveTab('conversation');
      return;
    }
    if (isTabId(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, searchParams, updateActiveTab]);

  useEffect(() => {
    // Keep active tab visible on small horizontal tablists.
    const activeTabButton = document.getElementById(TAB_LABEL_IDS[activeTab]);
    activeTabButton?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });

    // Do not force-scroll the shell to the composer in fullscreen chat mode.
    // The conversation header must remain visible under zoom and compact viewports.
  }, [activeTab]);

  // ═══ TAB HANDLERS ═══
  const tabHandlers = useMemo(
    () => ({
      conversation: () => updateActiveTab('conversation'),
      vision: () => updateActiveTab('vision'),
      overview: () => updateActiveTab('overview'),
      memoryMap: () => updateActiveTab('memory-map'),
      progression: () => updateActiveTab('progression'),
      transformation: () => updateActiveTab('transformation'),
    }),
    [updateActiveTab]
  );

  const isConversationTab = activeTab === 'conversation';

  // ═══ KEYBOARD SHORTCUTS (chat mode only) ═══
  useEffect(() => {
    if (!isConversationTab) return;
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleSidebarToggle();
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isConversationTab, handleSidebarToggle, handleNewConversation]);

  // Arrow-key navigation for tablist (ARIA tab pattern)
  const handleTabListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tabOrder = VALID_TABS;
      const currentIndex = tabOrder.indexOf(activeTab);
      const navigate = (targetTab: TabId | undefined) => {
        if (!targetTab) return;
        updateActiveTab(targetTab);
        document.getElementById(TAB_LABEL_IDS[targetTab])?.focus();
      };
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(tabOrder[(currentIndex + 1) % tabOrder.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(tabOrder[(currentIndex - 1 + tabOrder.length) % tabOrder.length]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigate(tabOrder[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigate(tabOrder[tabOrder.length - 1]);
      }
    },
    [activeTab, updateActiveTab]
  );

  // ═══ RENDER ACTIVE SECTION ═══
  const renderActiveSection = useCallback(() => {
    switch (activeTab) {
      case 'conversation':
        return (
          <ConversationSection
            showSectionHeader={!isConversationTab}
            fullscreen={isConversationTab}
          />
        );
      case 'vision':
        return <VisionSection />;
      case 'overview':
        return <OverviewSection stats={stats} />;
      case 'memory-map':
        return <MemorySection stats={stats} conversationId={conversationId} />;
      case 'progression':
        return <ProgressionSection progression={progression} stats={stats} />;
      case 'transformation':
        return <TransformationSection stats={stats} />;
      default:
        return (
          <ConversationSection
            showSectionHeader={!isConversationTab}
            fullscreen={isConversationTab}
          />
        );
    }
  }, [activeTab, isConversationTab, progression, stats]);

  // ═══ RENDER — CHAT FULLSCREEN MODE (sidebar + main) ═══
  if (isConversationTab) {
    return (
      <ErrorBoundary context="TitanePage">
        <div
          className="titane-chat-fullscreen-layout"
          data-testid="page-titane"
          data-layout="chat-fullscreen"
        >
          {/* ── SIDEBAR ── */}
          <ConversationHistorySidebar
            isOpen={sidebarOpen}
            onToggle={handleSidebarToggle}
            activeTab={activeTab}
            onTabChange={updateActiveTab}
            onNewConversation={handleNewConversation}
            onConversationSelect={handleSelectConversation}
            currentConversationId={conversationId || null}
          />

          {/* ── MAIN CHAT AREA ── */}
          <div
            className="titane-chat-fullscreen-main"
            data-testid="page-titane-content"
            role="main"
            id={TAB_PANEL_IDS['conversation']}
            aria-labelledby={TAB_LABEL_IDS['conversation']}
          >
            {/* ── CONVERSATION TITLE BAR ── */}
            <div className="titane-chat-title-bar" data-testid="chat-title-bar">
              <div className="titane-chat-title-bar-left">
                {editingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    className="titane-chat-title-bar-input"
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onBlur={() => void handleCommitTitleEdit()}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleCommitTitleEdit();
                      } else if (e.key === 'Escape') handleCancelTitleEdit();
                    }}
                    placeholder="Nom de la conversation…"
                    maxLength={80}
                    aria-label="Titre de la conversation"
                    data-testid="chat-title-input"
                  />
                ) : (
                  <button
                    className="titane-chat-title-bar-name"
                    onClick={handleStartTitleEdit}
                    title="Cliquer pour renommer"
                    aria-label="Titre de la conversation — cliquer pour renommer"
                    data-testid="chat-title-btn"
                  >
                    {activeConversation?.title &&
                    activeConversation.title !== 'Untitled' &&
                    activeConversation.title !== 'Nouvelle conversation'
                      ? activeConversation.title
                      : 'Nouvelle conversation'}
                  </button>
                )}
              </div>
              <div className="titane-chat-title-bar-actions">
                <button
                  className="titane-chat-title-bar-action-btn"
                  onClick={handleNewConversation}
                  title="Nouvelle conversation (Ctrl+N)"
                  aria-label="Nouvelle conversation"
                  data-testid="chat-title-new-btn"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            <ErrorBoundary context="TitaneTab:conversation">
              <ConversationSection
                key={chatKey}
                showSectionHeader={false}
                fullscreen={true}
              />
            </ErrorBoundary>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // ═══ RENDER — STANDARD MODE (tabs layout) ═══
  return (
    <ErrorBoundary context="TitanePage">
      <Container
        size="full"
        centered
        padding={4}
        className="titane-page"
        data-testid="page-titane"
        data-layout="standard"
      >
        <Stack direction="vertical" gap={4} className="titane-page-shell">
          {/* Runtime Truth Badge */}
          <SurfaceTruthBadge
            variant={memoryStats != null ? 'LIVE' : 'PARTIAL'}
            className="mb-2"
          />
          {/* ═══ PAGE HEADER ═══ */}
          <div className="titane-page-header">
            <div className="titane-page-header-brand flex items-center gap-3 mb-4">
              <TitaneLogo size={36} />
              <div>
                <h1 className="text-xl font-semibold text-titanium-text-primary">
                  ⚡ TITANE
                </h1>
                <p className="text-xs text-titanium-text-secondary">Le Cœur du Système</p>
              </div>
            </div>

            {/* ═══ SECTION TABS ═══ */}
            <div
              className="titane-inline-tabs"
              role="tablist"
              aria-label="Sections principales TITANE"
              onKeyDown={handleTabListKeyDown}
            >
              {(
                [
                  {
                    id: 'conversation',
                    label: '💬 Chat',
                    handler: tabHandlers.conversation,
                  },
                  {
                    id: 'overview',
                    label: '📊 Dashboard',
                    handler: tabHandlers.overview,
                  },
                  { id: 'vision', label: '📷 Vision', handler: tabHandlers.vision },
                  {
                    id: 'memory-map',
                    label: '💾 Mémoire',
                    handler: tabHandlers.memoryMap,
                  },
                  {
                    id: 'progression',
                    label: '⚡ Progression',
                    handler: tabHandlers.progression,
                  },
                  {
                    id: 'transformation',
                    label: '🌱 Évolution',
                    handler: tabHandlers.transformation,
                  },
                ] as Array<{ id: TabId; label: string; handler: () => void }>
              ).map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors duration-150 ${
                      isActive
                        ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                        : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                    }`}
                    data-testid={TAB_TEST_IDS[tab.id]}
                    onClick={tab.handler}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={TAB_PANEL_IDS[tab.id]}
                    id={TAB_LABEL_IDS[tab.id]}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ CONTENT AREA ═══ */}
          <div
            className="titane-content"
            data-testid="page-titane-content"
            role="tabpanel"
            id={TAB_PANEL_IDS[activeTab]}
            aria-labelledby={TAB_LABEL_IDS[activeTab]}
            tabIndex={0}
          >
            <ErrorBoundary context={`TitaneTab:${activeTab}`}>
              {renderActiveSection()}
            </ErrorBoundary>
          </div>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
};

export default TitanePage;
