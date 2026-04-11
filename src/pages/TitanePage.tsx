/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 — TITANE — LE CŒUR DU SYSTÈME (REFACTORED - Phase 3C)
 *
 * FUSION ULTIME de 3 modules majeurs:
 * - Chat IA (/chat) → Communication & Intelligence Conversationnelle
 * - Vision (/camera) → Perception Visuelle & Affect Estimation
 * - EVO (/evo) → Évolution Totale (Dashboard, Identity, Memory, Progression)
 *
 * 8 SECTIONS UNIFIÉES (EXTRACTED AS INDEPENDENT COMPONENTS):
 * 💬 CONVERSATION - Interface Chat IA multi-provider
 * 📷 VISION & PERCEPTION - Analyse visuelle et affective
 * 📊 VUE D'ENSEMBLE - Dashboard système et stats
 * 🔀 SYMBIOSE × IDENTITÉ - Fusion Twins + Identité, orchestration IA auto
 * 💾 MÉMOIRE TRIPLE - Architecture court/moyen/long terme
 * 🔄 ÉVOLUTION MÉMOIRE - Dynamiques internes et journal
 * ⚡ PROGRESSION & XP - Système XP, milestones, talents
 * 🌱 TRANSFORMATION - Lignes d'évolution et paliers
 *
 * Phase 3C Refactoring:
 * - Extracted 8 internal section components to src/components/sections/
 * - TitanePage now acts as an orchestrator/router for tab switching
 * - Bundle size optimized (1700+ duplicate lines removed from main file)
 * - Improved maintainability and reusability
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Stack } from '@components/layout';
import { createLogger } from '@/utils/logger';
import { useVisualEngines } from '@hooks/useVisualEngines';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import type { ProgressionState } from '@/cognitive/types';
import { tauriClient } from '@/lib/tauriClient';
import type { MemoryStats } from '@/services/memory/persistentMemory.config';
import { normalizePersistentMemoryStats } from '@/services/memory/persistentMemory.normalize';

// Section Components (Phase 3C Extracted — Identity+Twins unified into Symbiose)
import {
  ConversationSection,
  VisionSection,
  OverviewSection,
  MemorySection,
  MemoryEvolutionSection,
  ProgressionSection,
  TransformationSection,
} from '@/components/sections';
import type { TitaneStats } from '@/components/sections';
import { SymbioseIdentitySection } from '@/components/sections/SymbioseIdentitySection';

// UI Components
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TitaneLogo } from '@/components/branding/TitaneLogo';

import './TitanePage.css';
import './TitanePage-local.css';

const pageLogger = createLogger('TitanePage');

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

type TabId =
  | 'conversation'
  | 'vision'
  | 'overview'
  | 'memory-map'
  | 'memory-evolution'
  | 'progression'
  | 'transformation'
  | 'symbiose';

const VALID_TABS: TabId[] = [
  'conversation',
  'vision',
  'overview',
  'memory-map',
  'memory-evolution',
  'progression',
  'transformation',
  'symbiose',
];

const isTabId = (value: string | null): value is TabId => {
  return value !== null && VALID_TABS.includes(value as TabId);
};

const TAB_PANEL_IDS: Record<TabId, string> = {
  conversation: 'titane-panel-conversation',
  vision: 'titane-panel-vision',
  overview: 'titane-panel-overview',
  'memory-map': 'titane-panel-memory',
  'memory-evolution': 'titane-panel-evolution',
  progression: 'titane-panel-progression',
  transformation: 'titane-panel-transformation',
  symbiose: 'titane-panel-symbiose',
};

const TAB_LABEL_IDS: Record<TabId, string> = {
  conversation: 'titane-tab-conversation',
  vision: 'titane-tab-vision',
  overview: 'titane-tab-overview',
  'memory-map': 'titane-tab-memory',
  'memory-evolution': 'titane-tab-evolution',
  progression: 'titane-tab-progression',
  transformation: 'titane-tab-transformation',
  symbiose: 'titane-tab-symbiose',
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
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);

  // LOCK2: titane_active_conversation_id is canonical; legacy key migrated on boot.
  const [conversationId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('titane_active_conversation_id') ?? '';
  });

  // ═══ VISUAL ENGINES INITIALIZATION ═══
  useVisualEngines({
    engines: { stable: true, helios: true, nexus: true },
    health: 100,
    mode: 'stable',
  });

  // ═══ PROGRESSION LOADING + LIVE SUBSCRIPTION ═══
  useEffect(() => {
    const loadProgression = async () => {
      try {
        const state = await xpEngine.getState();
        setProgression(state);
      } catch (error) {
        pageLogger.error('Erreur chargement progression', error);
      }
    };
    loadProgression();
    // Live subscription — updates whenever XP is earned (e.g. per chat message)
    const unsubscribe = xpEngine.subscribe(state => setProgression({ ...state }));
    return () => unsubscribe();
  }, []);

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
    // Backward compat: ?tab=identity → symbiose (Identity merged into Symbiose)
    if (requestedTab === 'identity') {
      updateActiveTab('symbiose');
      return;
    }
    if (isTabId(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, searchParams, updateActiveTab]);

  // ═══ TAB HANDLERS ═══
  const tabHandlers = useMemo(
    () => ({
      conversation: () => updateActiveTab('conversation'),
      vision: () => updateActiveTab('vision'),
      overview: () => updateActiveTab('overview'),
      memoryMap: () => updateActiveTab('memory-map'),
      memoryEvolution: () => updateActiveTab('memory-evolution'),
      progression: () => updateActiveTab('progression'),
      transformation: () => updateActiveTab('transformation'),
      symbiose: () => updateActiveTab('symbiose'),
    }),
    [updateActiveTab]
  );

  // ═══ RENDER ACTIVE SECTION ═══
  const renderActiveSection = useCallback(() => {
    switch (activeTab) {
      case 'conversation':
        return <ConversationSection />;
      case 'vision':
        return <VisionSection />;
      case 'overview':
        return <OverviewSection stats={stats} />;
      case 'memory-map':
        return <MemorySection stats={stats} conversationId={conversationId} />;
      case 'memory-evolution':
        return <MemoryEvolutionSection />;
      case 'progression':
        return <ProgressionSection progression={progression} stats={stats} />;
      case 'transformation':
        return <TransformationSection stats={stats} />;
      case 'symbiose':
        return <SymbioseIdentitySection />;
      default:
        return <ConversationSection />;
    }
  }, [activeTab, progression, stats]);

  // ═══ RENDER ═══
  return (
    <ErrorBoundary context="TitanePage">
      <Container size="xl" className="titane-page" data-testid="page-titane">
        <Stack direction="vertical" gap={4}>
          {/* ═══ PAGE HEADER (Integrated, Not Navigation) ═══ */}
          <div className="titane-page-header">
            <div className="flex items-center gap-3 mb-4">
              <TitaneLogo size={36} />
              <div>
                <h1 className="text-xl font-semibold text-titanium-text-primary">
                  ⚡ TITANE
                </h1>
                <p className="text-xs text-titanium-text-secondary">Le Cœur du Système</p>
              </div>
            </div>

            {/* ═══ SECTION TABS (Inline Content Navigation) ═══ */}
            <div
              className="titane-inline-tabs"
              role="tablist"
              aria-label="Sections principales TITANE"
            >
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'conversation'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-conversation"
                onClick={tabHandlers.conversation}
                role="tab"
                aria-selected={activeTab === 'conversation'}
                aria-controls={TAB_PANEL_IDS.conversation}
                id={TAB_LABEL_IDS.conversation}
              >
                💬 Chat
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'overview'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-overview"
                onClick={tabHandlers.overview}
                role="tab"
                aria-selected={activeTab === 'overview'}
                aria-controls={TAB_PANEL_IDS.overview}
                id={TAB_LABEL_IDS.overview}
              >
                📊 Vue
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'vision'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-vision"
                onClick={tabHandlers.vision}
                role="tab"
                aria-selected={activeTab === 'vision'}
                aria-controls={TAB_PANEL_IDS.vision}
                id={TAB_LABEL_IDS.vision}
              >
                📷 Vision
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'memory-map'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-memory"
                onClick={tabHandlers.memoryMap}
                role="tab"
                aria-selected={activeTab === 'memory-map'}
                aria-controls={TAB_PANEL_IDS['memory-map']}
                id={TAB_LABEL_IDS['memory-map']}
              >
                💾 Mémoire
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'memory-evolution'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-memory-evolution"
                onClick={tabHandlers.memoryEvolution}
                role="tab"
                aria-selected={activeTab === 'memory-evolution'}
                aria-controls={TAB_PANEL_IDS['memory-evolution']}
                id={TAB_LABEL_IDS['memory-evolution']}
              >
                🔄 Évolution
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'progression'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-progression"
                onClick={tabHandlers.progression}
                role="tab"
                aria-selected={activeTab === 'progression'}
                aria-controls={TAB_PANEL_IDS.progression}
                id={TAB_LABEL_IDS.progression}
              >
                ⚡ XP
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'transformation'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-transformation"
                onClick={tabHandlers.transformation}
                role="tab"
                aria-selected={activeTab === 'transformation'}
                aria-controls={TAB_PANEL_IDS.transformation}
                id={TAB_LABEL_IDS.transformation}
              >
                🌱 Transform
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                  activeTab === 'symbiose'
                    ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                    : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
                }`}
                data-testid="tab-symbiose"
                onClick={tabHandlers.symbiose}
                role="tab"
                aria-selected={activeTab === 'symbiose'}
                aria-controls={TAB_PANEL_IDS.symbiose}
                id={TAB_LABEL_IDS.symbiose}
              >
                🔀 Symbiose × Identité
              </button>
            </div>
          </div>

          {/* ═══ CONTENT AREA (A11Y Enhanced) ═══ */}
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
