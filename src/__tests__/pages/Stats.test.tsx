/**
 * Tests Stats — Rule 16 coverage
 * Smoke render + page container landmark
 * AH-v89-RULE16-ENGINE-PAGES-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Stats } from '@/pages/Stats';

// ── Mock useEngineSubscription ───────────────────────────────────
vi.mock('../hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ data: null, loading: false }),
}));
vi.mock('@/hooks/useEngineSubscription', () => ({
  useEngineSubscription: () => ({ data: null, loading: false }),
}));

// ── Mock useResponsive ───────────────────────────────────────────
vi.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({ isMobile: false }),
}));

// ── Mock tauriClient ─────────────────────────────────────────────
vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    orchestrationGetCognitiveState: vi.fn().mockResolvedValue(null),
  },
}));

// ── Mock AgentDashboardsPanel ────────────────────────────────────
vi.mock('../components/AgentDashboardsPanel', () => ({
  default: () => <div data-testid="agent-dashboards-panel-mock" />,
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <Stats />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('Stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('page-stats')).toBeInTheDocument());
  });

  it('shows the page title', async () => {
    renderPage();
    // Title visible even in loading state
    expect(screen.getByText(/Statistiques Système/i)).toBeInTheDocument();
  });
});
