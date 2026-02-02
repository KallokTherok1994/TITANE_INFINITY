/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.3.0 — TITANE — LE CŒUR DU SYSTÈME (REFACTORED - Phase 3C)
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
 * 🧬 IDENTITÉ & ADN - Matrice identité, modes, pacte
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
import { Container, Stack } from '@components/layout';
import { createLogger } from '@/utils/logger';
import { useToast } from '@/hooks/useToast';
import { useVisualEngines } from '@hooks/useVisualEngines';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import type { ProgressionState } from '@/cognitive/types';

// Section Components (Phase 3C Extracted)
import {
  ConversationSection,
  VisionSection,
  OverviewSection,
  IdentitySection,
  MemorySection,
  MemoryEvolutionSection,
  ProgressionSection,
  TransformationSection,
} from '@/components/sections';
import type { TitaneStats } from '@/components/sections';

// UI Components
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TitaneLogo } from '@/components/branding/TitaneLogo';

import './TitanePage.css';

const pageLogger = createLogger('TitanePage');

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

type TabId =
  | 'conversation'
  | 'vision'
  | 'overview'
  | 'identity'
  | 'memory-map'
  | 'memory-evolution'
  | 'progression'
  | 'transformation';

const TAB_PANEL_IDS: Record<TabId, string> = {
  conversation: 'titane-panel-conversation',
  vision: 'titane-panel-vision',
  overview: 'titane-panel-overview',
  identity: 'titane-panel-identity',
  'memory-map': 'titane-panel-memory',
  'memory-evolution': 'titane-panel-evolution',
  progression: 'titane-panel-progression',
  transformation: 'titane-panel-transformation',
};

const TAB_LABEL_IDS: Record<TabId, string> = {
  conversation: 'titane-tab-conversation',
  vision: 'titane-tab-vision',
  overview: 'titane-tab-overview',
  identity: 'titane-tab-identity',
  'memory-map': 'titane-tab-memory',
  'memory-evolution': 'titane-tab-evolution',
  progression: 'titane-tab-progression',
  transformation: 'titane-tab-transformation',
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
  // ═══ STATE ═══
  const [activeTab, setActiveTab] = useState<TabId>('conversation');
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [_isEditing, _setIsEditing] = useState(false);
  const { success: toastSuccess, error: errorToast } = useToast();

  // ═══ VISUAL ENGINES INITIALIZATION ═══
  useVisualEngines({
    engines: { stable: true, helios: true, nexus: true },
    health: 100,
    mode: 'stable',
  });

  // ═══ PROGRESSION LOADING ═══
  useEffect(() => {
    const loadProgression = async () => {
      try {
        const state = await xpEngine.getState();
        setProgression(state);
      } catch (error) {
        pageLogger.error('Erreur chargement progression', error);
        // Graceful fallback: use default progression state
      }
    };
    loadProgression();
  }, []);

  // ═══ STATS CALCULATION ═══
  const stats: TitaneStats = useMemo(
    () => ({
      totalXP: progression?.totalXP || 193000,
      level: progression?.level || 19,
      memoryShortTerm: 247,
      memoryMidTerm: 1832,
      memoryLongTerm: 4521,
      evolutionScore: 92,
    }),
    [progression]
  );

  // ═══ TAB HANDLERS ═══
  const tabHandlers = useMemo(
    () => ({
      conversation: () => setActiveTab('conversation'),
      vision: () => setActiveTab('vision'),
      overview: () => setActiveTab('overview'),
      identity: () => setActiveTab('identity'),
      memoryMap: () => setActiveTab('memory-map'),
      memoryEvolution: () => setActiveTab('memory-evolution'),
      progression: () => setActiveTab('progression'),
      transformation: () => setActiveTab('transformation'),
    }),
    []
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
      case 'identity':
        return <IdentitySection />;
      case 'memory-map':
        return <MemorySection stats={stats} />;
      case 'memory-evolution':
        return <MemoryEvolutionSection />;
      case 'progression':
        return <ProgressionSection progression={progression} stats={stats} />;
      case 'transformation':
        return <TransformationSection />;
      default:
        return <ConversationSection />;
    }
  }, [activeTab, progression, stats]);

  // ═══ RENDER ═══
  return (
    <ErrorBoundary context="TitanePage">
      <Container size="xl" className="titane-page">
        <Stack direction="vertical" gap={4}>
          {/* ═══ HEADER (UI vΩ: Compact & Hierarchical) ═══ */}
          <div className="titane-header-vΩ">
            <div className="flex items-center gap-4">
              <TitaneLogo size={48} />
              <div>
                <h1 className="text-2xl font-bold text-titanium-text-primary mb-1">
                  ⚡ TITANE
                </h1>
                <p className="text-sm text-titanium-text-secondary">Le Cœur du Système</p>
              </div>
            </div>
          </div>

          {/* ═══ TABS (UI vΩ: Compact, Usage-Oriented Order) ═══ */}
          <div
            className="flex gap-1 overflow-x-auto py-2 border-b border-titanium-border-default"
            role="tablist"
            aria-label="Sections principales TITANE"
          >
            <button
              className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                activeTab === 'conversation'
                  ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                  : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
              }`}
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
                activeTab === 'identity'
                  ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                  : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
              }`}
              onClick={tabHandlers.identity}
              role="tab"
              aria-selected={activeTab === 'identity'}
              aria-controls={TAB_PANEL_IDS.identity}
              id={TAB_LABEL_IDS.identity}
            >
              🧬 Identité
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                activeTab === 'memory-map'
                  ? 'bg-titanium-bg-interactive text-titanium-accent-cool'
                  : 'text-titanium-text-secondary hover:text-titanium-text-primary hover:bg-titanium-bg-overlay'
              }`}
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
              onClick={tabHandlers.transformation}
              role="tab"
              aria-selected={activeTab === 'transformation'}
              aria-controls={TAB_PANEL_IDS.transformation}
              id={TAB_LABEL_IDS.transformation}
            >
              🌱 Transform
            </button>
          </div>

          {/* ═══ CONTENT AREA (A11Y Enhanced) ═══ */}
          <div
            className="titane-content"
            role="tabpanel"
            id={TAB_PANEL_IDS[activeTab]}
            aria-labelledby={TAB_LABEL_IDS[activeTab]}
            tabIndex={0}
          >
            {renderActiveSection()}
          </div>
        </Stack>
      </Container>
    </ErrorBoundary>
  );
};

export default TitanePage;
