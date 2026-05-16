/**
 * Tests PerfectFusionDashboard — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge LIVE/PARTIAL/DEGRADED (AH-v95)
 * AH-v88-PAGES-BADGE-STABILIZE-2026-05-12 → AH-v95-2026-05-26
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PerfectFusionDashboard } from '@/pages/PerfectFusionDashboard';

// ── Mock @/utils/invoke (safeInvokeCanonical) ────────────────────
vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: vi.fn().mockResolvedValue({
    ok: true,
    content: {
      harmonia: { balance_score: 92, initialized: true },
      cognition: { load: 0.15 },
    },
    error: null,
  }),
}));

// ── Legacy mock (kept for transitional coverage) ─────────────────
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({
    harmonia: { balance_score: 92, initialized: true },
    cognition: { load: 0.15 },
  }),
}));

// ── Mock useSingularity ──────────────────────────────────────────
vi.mock('@/hooks/useSingularity', () => ({
  useSingularity: () => ({
    state: {
      consciousness: 3.8,
      unity: { globalHarmony: 0.93, globalEntropy: 0.08 },
      isInitialized: true,
      autoCoherence: 0.91,
    },
    consciousness: 3.8,
    globalHarmony: 0.93,
    globalEntropy: 0.08,
    isInitialized: true,
    autoCoherence: 0.91,
    initialize: vi.fn(),
    reset: vi.fn(),
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────
function renderPage() {
  return render(
    <MemoryRouter>
      <PerfectFusionDashboard />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────
describe('PerfectFusionDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('page-fusion')).toBeInTheDocument();
    expect(screen.getByTestId('page-fusion-content')).toBeInTheDocument();
  });

  it('shows SurfaceTruthBadge (LIVE, PARTIAL, or DEGRADED — not SIMULATED)', () => {
    renderPage();
    const badge =
      screen.queryByTestId('surface-truth-badge-live') ??
      screen.queryByTestId('surface-truth-badge-partial') ??
      screen.queryByTestId('surface-truth-badge-degraded');
    expect(badge).not.toBeNull();
  });

  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Perfect Fusion Dashboard')).toBeInTheDocument();
  });

  it('does not call Math.random at initial render', () => {
    const spy = vi.spyOn(Math, 'random');
    renderPage();
    // La page ne doit pas générer de données aléatoires au rendu initial
    expect(spy).not.toHaveBeenCalled();
  });

  it('keeps fusion helper labels above low-contrast tokens', async () => {
    renderPage();

    expect(await screen.findByText('🟢 Excellent')).toHaveClass('text-titanium-text-secondary');
    expect((await screen.findAllByText('cognitive'))[0]).toHaveClass('text-titanium-text-secondary');
    expect((await screen.findAllByText('Actif'))[0]).toHaveClass('text-green-200');
  });
});
