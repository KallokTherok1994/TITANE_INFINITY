/**
 * Tests PerfectFusionDashboard — Rule 16 coverage
 * Smoke render + SurfaceTruthBadge SIMULATED + plus de Math.random()
 * AH-v88-PAGES-BADGE-STABILIZE-2026-05-12
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PerfectFusionDashboard } from '@/pages/PerfectFusionDashboard';

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
  });

  it('shows SurfaceTruthBadge with SIMULATED variant', () => {
    renderPage();
    expect(screen.getByTestId('surface-truth-badge-simulated')).toBeInTheDocument();
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
});
