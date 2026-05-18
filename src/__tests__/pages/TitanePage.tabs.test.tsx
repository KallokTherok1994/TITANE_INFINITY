/**
 * TitanePage — Tab audit tests (Vitest/React Testing Library)
 * Covers: 6 main tabs data-testid, a11y roles, aria-controls, navigation,
 * URL param routing, legacy param fallback, data-layout attribute.
 *
 * Rule 16 compliance: AH-20260504-CHAT-TABS-AUDIT-0006
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ═══ Mocks ═══
vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));
vi.mock('@hooks/useVisualEngines', () => ({ useVisualEngines: vi.fn() }));
vi.mock('@/cognitive/progression/xpEngine', () => ({
  createProgressionStateFromExperience: vi.fn().mockReturnValue({
    totalXP: 0,
    level: 1,
    chatMessageCount: 0,
    xpInCurrentLevel: 0,
    xpToNextLevel: 100,
    lastQualityTier: null,
    qualityTierCounts: {},
    milestones: [],
    unlockedMilestones: [],
    lastXPGain: null,
    streakDays: 0,
    lastActiveDate: '2026-05-18',
    createdAt: 1,
    updatedAt: 1,
  }),
  xpEngine: {
    getState: vi.fn().mockResolvedValue({ totalXP: 0, level: 1, chatMessageCount: 0 }),
    subscribe: vi.fn().mockReturnValue(vi.fn()),
  },
}));
vi.mock('@/hooks/useExperience', () => ({
  useExperience: () => ({
    state: { totalXp: 0, level: 0, domains: {}, history: [], lastUpdated: 1, version: '1.0.0' },
  }),
}));
vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    persistentMemoryGetStats: vi.fn().mockResolvedValue({}),
  },
}));
vi.mock('@/services/memory/persistentMemory.normalize', () => ({
  normalizePersistentMemoryStats: vi.fn().mockReturnValue({}),
}));

// Mock all section components with minimal stubs
vi.mock('@/components/sections', () => ({
  ConversationSection: () => (
    <div data-testid="conversation-section">
      <div data-testid="chat-input" />
    </div>
  ),
  VisionSection: () => <div data-testid="vision-section" />,
  OverviewSection: () => <div data-testid="overview-section" />,
  MemorySection: () => (
    <div data-testid="memory-section">
      <button data-testid="memory-tab-overview" role="tab" aria-selected={true}>
        Vue d'ensemble
      </button>
      <button data-testid="memory-tab-dashboard" role="tab" aria-selected={false}>
        Dashboard
      </button>
      <button data-testid="memory-tab-tree" role="tab" aria-selected={false}>
        Arbre
      </button>
      <button data-testid="memory-tab-search" role="tab" aria-selected={false}>
        Recherche
      </button>
    </div>
  ),
  ProgressionSection: () => <div data-testid="progression-section" />,
  TransformationSection: () => <div data-testid="transformation-section" />,
}));
vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/branding/TitaneLogo', () => ({
  TitaneLogo: () => <div data-testid="titane-logo" />,
}));
vi.mock('@/components/chat/ConversationHistorySidebar', () => ({
  ConversationHistorySidebar: ({
    onTabChange,
  }: {
    onTabChange: (tab: 'conversation' | 'vision' | 'overview' | 'memory-map' | 'progression' | 'transformation') => void;
  }) => (
    <aside data-testid="conversation-history-sidebar" aria-label="Historique des conversations">
      <button data-testid="sidebar-tab-overview" onClick={() => onTabChange('overview')}>
        Dashboard
      </button>
    </aside>
  ),
}));
vi.mock('@components/layout', () => ({
  Container: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    size?: string;
    centered?: boolean;
    padding?: number;
  }) => <div {...props}>{children}</div>,
  Stack: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { direction?: string; gap?: number }) => (
    <div {...props}>{children}</div>
  ),
}));

import { TitanePage } from '@/pages/TitanePage';

const renderPage = (initialEntry = '/titane?tab=overview') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TitanePage />
    </MemoryRouter>
  );

describe('TitanePage — Tab data-testids & a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── A1: All 6 tabs have stable data-testid ───
  it('A1 — 6 tab data-testids are all present in DOM', () => {
    renderPage();
    expect(screen.getByTestId('tab-conversation')).toBeInTheDocument();
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-vision')).toBeInTheDocument();
    expect(screen.getByTestId('tab-memory')).toBeInTheDocument();
    expect(screen.getByTestId('tab-progression')).toBeInTheDocument();
    expect(screen.getByTestId('tab-transformation')).toBeInTheDocument();
  });

  // ─── A2: Tablist role and aria-label ───
  it('A2 — tablist has role=tablist and aria-label', () => {
    renderPage();
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-label', 'Sections principales TITANE');
  });

  // ─── A3: Each tab has role=tab ───
  it('A3 — all 6 tabs have role=tab', () => {
    renderPage();
    const tabs = screen.getAllByRole('tab');
    // 6 TitanePage tabs; MemorySection sub-tabs are rendered via mock too
    const titaneTabs = tabs.filter(t =>
      [
        'tab-conversation',
        'tab-overview',
        'tab-vision',
        'tab-memory',
        'tab-progression',
        'tab-transformation',
      ].includes(t.getAttribute('data-testid') ?? '')
    );
    expect(titaneTabs).toHaveLength(6);
  });

  // ─── A4: overview tab is aria-selected=true in standard tab layout ───
  it('A4 — overview tab is aria-selected in standard tab layout', () => {
    renderPage();
    const overviewTab = screen.getByTestId('tab-overview');
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  // ─── A5: other tabs are aria-selected=false by default ───
  it('A5 — non-active tabs are aria-selected=false in standard tab layout', () => {
    renderPage();
    expect(screen.getByTestId('tab-conversation')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByTestId('tab-vision')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('tab-memory')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('tab-progression')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByTestId('tab-transformation')).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  // ─── A6: aria-controls points to correct panel id ───
  it('A6 — overview tab aria-controls = titane-panel-overview', () => {
    renderPage();
    expect(screen.getByTestId('tab-overview')).toHaveAttribute(
      'aria-controls',
      'titane-panel-overview'
    );
  });

  // ─── A7: tabpanel has correct id and role ───
  it('A7 — content area has role=tabpanel with correct id', () => {
    renderPage();
    const panel = screen.getByTestId('page-titane-content');
    expect(panel).toHaveAttribute('role', 'tabpanel');
    expect(panel).toHaveAttribute('id', 'titane-panel-overview');
  });

  // ─── A8: data-layout=standard for non-conversation tabs ───
  it('A8 — page-titane has data-layout=standard in tab layout', () => {
    renderPage();
    const page = screen.getByTestId('page-titane');
    expect(page).toHaveAttribute('data-layout', 'standard');
  });

  it('A9 — /titane opens chat fullscreen with sidebar and no inline tablist', () => {
    renderPage('/titane');
    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('conversation-history-sidebar')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-titane-content')).toHaveAttribute(
      'role',
      'main'
    );
  });
});

describe('TitanePage — Tab navigation', () => {
  it('N1 — clicking tab-overview switches aria-selected and shows overview section', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-overview'));
    expect(screen.getByTestId('tab-overview')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('tab-conversation')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByTestId('overview-section')).toBeInTheDocument();
  });

  it('N2 — clicking tab-memory shows memory section and aria-selected updates', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-memory'));
    expect(screen.getByTestId('tab-memory')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('memory-section')).toBeInTheDocument();
  });

  it('N3 — clicking tab-vision shows vision section', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-vision'));
    expect(screen.getByTestId('tab-vision')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('vision-section')).toBeInTheDocument();
  });

  it('N4 — clicking tab-progression shows progression section', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-progression'));
    expect(screen.getByTestId('tab-progression')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('progression-section')).toBeInTheDocument();
  });

  it('N5 — data-layout=standard after leaving conversation tab', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-overview'));
    const page = screen.getByTestId('page-titane');
    expect(page).toHaveAttribute('data-layout', 'standard');
  });

  it('N6 — tabpanel id updates when tab changes', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-progression'));
    const panel = screen.getByTestId('page-titane-content');
    expect(panel).toHaveAttribute('id', 'titane-panel-progression');
  });
});

describe('TitanePage — URL param routing', () => {
  it('U1 — ?tab=overview activates overview tab on load', () => {
    renderPage('/titane?tab=overview');
    expect(screen.getByTestId('tab-overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('U2 — ?tab=memory-map activates memory tab on load', () => {
    renderPage('/titane?tab=memory-map');
    expect(screen.getByTestId('tab-memory')).toHaveAttribute('aria-selected', 'true');
  });

  it('U3 — invalid ?tab= falls back to conversation', () => {
    renderPage('/titane?tab=INVALID_TAB');
    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('conversation-history-sidebar')).toBeInTheDocument();
  });

  it('U4 — ?tab=identity (legacy) falls back to conversation', () => {
    renderPage('/titane?tab=identity');
    expect(screen.getByTestId('page-titane')).toHaveAttribute(
      'data-layout',
      'chat-fullscreen'
    );
    expect(screen.getByTestId('conversation-history-sidebar')).toBeInTheDocument();
  });
});
